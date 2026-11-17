export interface ParsedClassDef {
  name: string;
  methods: Record<
    string,
    {
      params: string[];
      defaults: Record<string, string>;
      bodyLines: { indent: number; text: string; lineNo: number }[];
    }
  >;
}

export interface InterpretedInstance {
  id: string;
  varName: string;
  address: string;
  className: string;
  attrs: Record<string, string | number | boolean>;
}

export interface ExecutionResult {
  consoleLines: string[];
  classes: ParsedClassDef[];
  instances: InterpretedInstance[];
  error: string | null;
}

type PyValue = string | number | boolean | InterpretedInstance | null;

function splitTopLevelArgs(argStr: string): string[] {
  const args: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let depth = 0;

  for (let i = 0; i < argStr.length; i++) {
    const ch = argStr[i];
    if (quote) {
      current += ch;
      if (ch === quote && argStr[i - 1] !== '\\') {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
    } else if (ch === '(') {
      depth++;
      current += ch;
    } else if (ch === ')') {
      depth--;
      current += ch;
    } else if (ch === ',' && depth === 0) {
      if (current.trim()) args.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

function stripInlineComment(line: string): string {
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote && line[i - 1] !== '\\') quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '#') {
      return line.slice(0, i);
    }
  }
  return line;
}

function formatPyValue(val: PyValue): string {
  if (val === null || val === undefined) return 'None';
  if (typeof val === 'boolean') return val ? 'True' : 'False';
  if (typeof val === 'object' && 'address' in val) {
    return `<${val.className} object at ${val.address}>`;
  }
  return String(val);
}

function findTopLevelOperator(expr: string, op: string): number {
  let quote: '"' | "'" | null = null;
  let depth = 0;
  for (let i = 0; i <= expr.length - op.length; i++) {
    const ch = expr[i];
    if (quote) {
      if (ch === quote && expr[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (depth === 0 && expr.slice(i, i + op.length) === op) {
      return i;
    }
  }
  return -1;
}

function findLastTopLevelOperator(expr: string, op: string): number {
  let quote: '"' | "'" | null = null;
  let depth = 0;
  let lastIdx = -1;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (quote) {
      if (ch === quote && expr[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (depth === 0 && ch === op) {
      const prev = expr[i - 1];
      const next = expr[i + 1];
      if (next === '=') continue;
      if (op === '-' && (i === 0 || '+-*/(<>='.includes(prev))) continue;
      lastIdx = i;
    }
  }
  return lastIdx;
}

function evalExpression(
  rawExpr: string,
  env: Record<string, PyValue>,
  selfObj: InterpretedInstance | null,
  lineNo: number
): PyValue {
  const expr = rawExpr.trim();
  if (!expr) return null;

  // f-string: f"..." or f'...'
  if ((expr.startsWith('f"') && expr.endsWith('"')) || (expr.startsWith("f'") && expr.endsWith("'"))) {
    const inner = expr.slice(2, -1);
    return inner.replace(/\{([^}]+)\}/g, (_, subExpr) => {
      const evaluated = evalExpression(subExpr, env, selfObj, lineNo);
      return formatPyValue(evaluated);
    });
  }

  // Plain string literal
  if (
    (expr.startsWith('"') && expr.endsWith('"') && expr.indexOf('"', 1) === expr.length - 1) ||
    (expr.startsWith("'") && expr.endsWith("'") && expr.indexOf("'", 1) === expr.length - 1)
  ) {
    return expr.slice(1, -1);
  }

  if (expr === 'True') return true;
  if (expr === 'False') return false;
  if (expr === 'None') return null;

  // Number literal
  if (/^-?\d+(\.\d+)?$/.test(expr)) {
    return Number(expr);
  }

  // min(...) or max(...)
  const minMaxMatch = expr.match(/^(min|max)\((.+)\)$/);
  if (minMaxMatch) {
    const fn = minMaxMatch[1];
    const parts = splitTopLevelArgs(minMaxMatch[2]).map((p) =>
      Number(evalExpression(p, env, selfObj, lineNo))
    );
    if (parts.some((n) => Number.isNaN(n))) {
      throw new Error(`第 ${lineNo} 行：${fn}() 只能用來比較數字。`);
    }
    return fn === 'min' ? Math.min(...parts) : Math.max(...parts);
  }

  // Comparison operators
  for (const op of ['>=', '<=', '==', '!=', '>', '<']) {
    const idx = findTopLevelOperator(expr, op);
    if (idx !== -1) {
      const left = evalExpression(expr.slice(0, idx), env, selfObj, lineNo);
      const right = evalExpression(expr.slice(idx + op.length), env, selfObj, lineNo);
      switch (op) {
        case '>=':
          return Number(left) >= Number(right);
        case '<=':
          return Number(left) <= Number(right);
        case '==':
          return left === right;
        case '!=':
          return left !== right;
        case '>':
          return Number(left) > Number(right);
        case '<':
          return Number(left) < Number(right);
      }
    }
  }

  // Addition / Subtraction
  for (const op of ['+', '-']) {
    const idx = findLastTopLevelOperator(expr, op);
    if (idx > 0) {
      const left = evalExpression(expr.slice(0, idx), env, selfObj, lineNo);
      const right = evalExpression(expr.slice(idx + 1), env, selfObj, lineNo);
      if (op === '+') {
        if (typeof left === 'string' || typeof right === 'string') {
          return formatPyValue(left) + formatPyValue(right);
        }
        return Number(left) + Number(right);
      }
      return Number(left) - Number(right);
    }
  }

  // Multiplication / Division
  for (const op of ['*', '/']) {
    const idx = findLastTopLevelOperator(expr, op);
    if (idx > 0) {
      const left = Number(evalExpression(expr.slice(0, idx), env, selfObj, lineNo));
      const right = Number(evalExpression(expr.slice(idx + 1), env, selfObj, lineNo));
      return op === '*' ? left * right : left / right;
    }
  }

  if (expr.startsWith('(') && expr.endsWith(')')) {
    return evalExpression(expr.slice(1, -1), env, selfObj, lineNo);
  }

  // Attribute access: self.attr or var.attr
  const dotMatch = expr.match(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)$/);
  if (dotMatch) {
    const [, targetName, attrName] = dotMatch;
    let obj: PyValue = null;
    if (targetName === 'self') {
      if (!selfObj) {
        throw new Error(`第 ${lineNo} 行：在類別方法外部無法使用 self。`);
      }
      obj = selfObj;
    } else {
      if (!(targetName in env)) {
        throw new Error(`第 ${lineNo} 行：找不到變數「${targetName}」，請確認是否已經先建立它。`);
      }
      obj = env[targetName];
    }

    if (!obj || typeof obj !== 'object' || !('attrs' in obj)) {
      throw new Error(`第 ${lineNo} 行：「${targetName}」不是一個物件，無法讀取屬性 .${attrName}。`);
    }
    if (!(attrName in obj.attrs)) {
      throw new Error(
        `第 ${lineNo} 行：AttributeError — ${obj.className} 物件沒有「${attrName}」這個屬性。`
      );
    }
    return obj.attrs[attrName];
  }

  // Variable lookup
  if (/^[A-Za-z_]\w*$/.test(expr)) {
    if (expr === 'self' && selfObj) return selfObj;
    if (!(expr in env)) {
      throw new Error(`第 ${lineNo} 行：NameError — 找不到名稱「${expr}」。`);
    }
    return env[expr];
  }

  throw new Error(`第 ${lineNo} 行：目前迷你直譯器無法解析表達式「${expr}」。`);
}

export function runMiniPythonOop(code: string): ExecutionResult {
  const consoleLines: string[] = [];
  const classesMap: Record<string, ParsedClassDef> = {};
  const instances: InterpretedInstance[] = [];
  const env: Record<string, PyValue> = {};
  let addrCounter = 0x104a;

  const rawLines = code.split('\n');
  const lines = rawLines
    .map((raw, idx) => {
      const cleaned = stripInlineComment(raw).replace(/\s+$/, '');
      const indent = cleaned.match(/^ */)?.[0].length ?? 0;
      return {
        lineNo: idx + 1,
        indent,
        text: cleaned.trim(),
      };
    })
    .filter((l) => l.text.length > 0);

  try {
    let i = 0;
    const topStatements: { indent: number; text: string; lineNo: number }[] = [];

    while (i < lines.length) {
      const line = lines[i];
      if (line.indent === 0 && line.text.startsWith('class ')) {
        const classMatch = line.text.match(/^class\s+([A-Za-z_]\w*)\s*:$/);
        if (!classMatch) {
          throw new Error(`第 ${line.lineNo} 行：class 語法格式錯誤，應為「class 類別名稱:」。`);
        }
        const className = classMatch[1];
        const classDef: ParsedClassDef = { name: className, methods: {} };
        const classIndent = line.indent;
        i++;

        while (i < lines.length && lines[i].indent > classIndent) {
          const memberLine = lines[i];
          if (memberLine.text.startsWith('def ')) {
            const defMatch = memberLine.text.match(/^def\s+([A-Za-z_]\w*)\(([^)]*)\)\s*:$/);
            if (!defMatch) {
              throw new Error(
                `第 ${memberLine.lineNo} 行：方法定義格式錯誤，請確認是否有括號與冒號 (:)。`
              );
            }
            const methodName = defMatch[1];
            const rawParams = splitTopLevelArgs(defMatch[2]);
            if (rawParams.length === 0 || rawParams[0] !== 'self') {
              throw new Error(
                `第 ${memberLine.lineNo} 行：類別方法「${methodName}」的第一個參數必須寫成 self。`
              );
            }
            const params: string[] = [];
            const defaults: Record<string, string> = {};
            for (const rp of rawParams.slice(1)) {
              const eqIdx = rp.indexOf('=');
              if (eqIdx !== -1) {
                const pName = rp.slice(0, eqIdx).trim();
                const pDef = rp.slice(eqIdx + 1).trim();
                params.push(pName);
                defaults[pName] = pDef;
              } else {
                params.push(rp.trim());
              }
            }

            const methodIndent = memberLine.indent;
            const bodyLines: { indent: number; text: string; lineNo: number }[] = [];
            i++;
            while (i < lines.length && lines[i].indent > methodIndent) {
              bodyLines.push(lines[i]);
              i++;
            }
            if (bodyLines.length === 0) {
              throw new Error(`第 ${memberLine.lineNo} 行：方法「${methodName}」內部不能是空的。`);
            }
            classDef.methods[methodName] = { params, defaults, bodyLines };
          } else {
            throw new Error(
              `第 ${memberLine.lineNo} 行：在 class ${className} 內請使用 def 定義方法或 __init__。`
            );
          }
        }
        classesMap[className] = classDef;
      } else {
        if (line.indent > 0) {
          throw new Error(`第 ${line.lineNo} 行：縮排位置不正確（IndentationError）。`);
        }
        topStatements.push(line);
        i++;
      }
    }

    const invokeMethod = (
      obj: InterpretedInstance,
      methodName: string,
      argExprs: string[],
      callerEnv: Record<string, PyValue>,
      callLineNo: number
    ): PyValue => {
      const cls = classesMap[obj.className];
      const method = cls?.methods[methodName];
      if (!method) {
        throw new Error(
          `第 ${callLineNo} 行：AttributeError — ${obj.className} 物件沒有「${methodName}()」這個方法。`
        );
      }
      const localEnv: Record<string, PyValue> = { ...callerEnv };
      const requiredCount = method.params.filter((p) => !(p in method.defaults)).length;
      if (argExprs.length < requiredCount || argExprs.length > method.params.length) {
        throw new Error(
          `第 ${callLineNo} 行：TypeError — ${methodName}() 需要 ${method.params.length} 個參數（不含 self），但您傳入了 ${argExprs.length} 個。`
        );
      }

      method.params.forEach((param, idx) => {
        if (idx < argExprs.length) {
          localEnv[param] = evalExpression(argExprs[idx], callerEnv, null, callLineNo);
        } else {
          localEnv[param] = evalExpression(method.defaults[param], callerEnv, null, callLineNo);
        }
      });

      const res = executeBlock(method.bodyLines, localEnv, obj);
      return res.returnValue;
    };

    const executeBlock = (
      block: { indent: number; text: string; lineNo: number }[],
      localEnv: Record<string, PyValue>,
      selfObj: InterpretedInstance | null
    ): { returned: boolean; returnValue: PyValue } => {
      let idx = 0;
      while (idx < block.length) {
        const stmt = block[idx];
        const text = stmt.text;

        if (text === 'pass') {
          idx++;
          continue;
        }

        if (text.startsWith('if ') && text.endsWith(':')) {
          const condExpr = text.slice(3, -1).trim();
          const condResult = Boolean(evalExpression(condExpr, localEnv, selfObj, stmt.lineNo));
          const baseIndent = stmt.indent;
          idx++;
          const ifBody: typeof block = [];
          while (idx < block.length && block[idx].indent > baseIndent) {
            ifBody.push(block[idx]);
            idx++;
          }

          let elseBody: typeof block = [];
          if (idx < block.length && block[idx].indent === baseIndent && block[idx].text === 'else:') {
            idx++;
            while (idx < block.length && block[idx].indent > baseIndent) {
              elseBody.push(block[idx]);
              idx++;
            }
          }

          const chosen = condResult ? ifBody : elseBody;
          if (chosen.length > 0) {
            const subRes = executeBlock(chosen, localEnv, selfObj);
            if (subRes.returned) return subRes;
          }
          continue;
        }

        const printMatch = text.match(/^print\((.*)\)$/);
        if (printMatch) {
          const argStr = printMatch[1].trim();
          if (!argStr) {
            consoleLines.push('');
          } else {
            const args = splitTopLevelArgs(argStr);
            const evaluated = args.map((a) => {
              const mCall = a.match(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)\((.*)\)$/);
              if (mCall) {
                const [, varName, mName, mArgsStr] = mCall;
                const target = localEnv[varName];
                if (target && typeof target === 'object' && 'attrs' in target) {
                  return formatPyValue(
                    invokeMethod(
                      target,
                      mName,
                      splitTopLevelArgs(mArgsStr),
                      localEnv,
                      stmt.lineNo
                    )
                  );
                }
              }
              return formatPyValue(evalExpression(a, localEnv, selfObj, stmt.lineNo));
            });
            consoleLines.push(evaluated.join(' '));
          }
          idx++;
          continue;
        }

        if (text.startsWith('return ')) {
          const val = evalExpression(text.slice(7), localEnv, selfObj, stmt.lineNo);
          return { returned: true, returnValue: val };
        }

        const augAttrMatch = text.match(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)\s*(\+=|-=)\s*(.+)$/);
        if (augAttrMatch) {
          const [, targetName, attrName, op, rhs] = augAttrMatch;
          const target = targetName === 'self' ? selfObj : localEnv[targetName];
          if (!target || typeof target !== 'object' || !('attrs' in target)) {
            throw new Error(`第 ${stmt.lineNo} 行：找不到物件「${targetName}」。`);
          }
          const current = Number(target.attrs[attrName] ?? 0);
          const delta = Number(evalExpression(rhs, localEnv, selfObj, stmt.lineNo));
          target.attrs[attrName] = op === '+=' ? current + delta : current - delta;
          idx++;
          continue;
        }

        const attrAssignMatch = text.match(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)\s*=\s*(.+)$/);
        if (attrAssignMatch) {
          const [, targetName, attrName, rhs] = attrAssignMatch;
          const target = targetName === 'self' ? selfObj : localEnv[targetName];
          if (!target || typeof target !== 'object' || !('attrs' in target)) {
            throw new Error(`第 ${stmt.lineNo} 行：找不到物件「${targetName}」。`);
          }
          const val = evalExpression(rhs, localEnv, selfObj, stmt.lineNo);
          if (val !== null && typeof val === 'object') {
            throw new Error(`第 ${stmt.lineNo} 行：屬性值請使用文字、數字或布林值。`);
          }
          target.attrs[attrName] = val === null ? 'None' : val;
          idx++;
          continue;
        }

        const methodCallMatch = text.match(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)\((.*)\)$/);
        if (methodCallMatch) {
          const [, targetName, methodName, argsStr] = methodCallMatch;
          const target = targetName === 'self' ? selfObj : localEnv[targetName];
          if (!target || typeof target !== 'object' || !('attrs' in target)) {
            throw new Error(`第 ${stmt.lineNo} 行：找不到物件「${targetName}」，無法呼叫 .${methodName}()。`);
          }
          invokeMethod(target, methodName, splitTopLevelArgs(argsStr), localEnv, stmt.lineNo);
          idx++;
          continue;
        }

        const assignMatch = text.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
        if (assignMatch) {
          const [, varName, rhs] = assignMatch;
          const ctorMatch = rhs.match(/^([A-Za-z_]\w*)\((.*)\)$/);
          if (ctorMatch && ctorMatch[1] in classesMap) {
            const clsName = ctorMatch[1];
            const cls = classesMap[clsName];
            const newObj: InterpretedInstance = {
              id: `inst-${instances.length + 1}`,
              varName,
              address: `0x${addrCounter.toString(16).toUpperCase()}`,
              className: clsName,
              attrs: {},
            };
            addrCounter += 0x1045;
            instances.push(newObj);
            localEnv[varName] = newObj;
            if ('__init__' in cls.methods) {
              invokeMethod(
                newObj,
                '__init__',
                splitTopLevelArgs(ctorMatch[2]),
                localEnv,
                stmt.lineNo
              );
            }
          } else {
            const rhsMethodMatch = rhs.match(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)\((.*)\)$/);
            if (rhsMethodMatch && rhsMethodMatch[1] in localEnv) {
              const target = localEnv[rhsMethodMatch[1]];
              if (target && typeof target === 'object' && 'attrs' in target) {
                localEnv[varName] = invokeMethod(
                  target,
                  rhsMethodMatch[2],
                  splitTopLevelArgs(rhsMethodMatch[3]),
                  localEnv,
                  stmt.lineNo
                );
                idx++;
                continue;
              }
            }
            localEnv[varName] = evalExpression(rhs, localEnv, selfObj, stmt.lineNo);
          }
          idx++;
          continue;
        }

        throw new Error(`第 ${stmt.lineNo} 行：無法執行的語法「${text}」。`);
      }
      return { returned: false, returnValue: null };
    };

    executeBlock(topStatements, env, null);

    return {
      consoleLines,
      classes: Object.values(classesMap),
      instances,
      error: null,
    };
  } catch (err) {
    return {
      consoleLines,
      classes: Object.values(classesMap),
      instances,
      error: err instanceof Error ? err.message : '執行程式碼時發生未知錯誤。',
    };
  }
}
