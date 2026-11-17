export interface BlueprintField {
  key: string;
  label: string;
  type: 'text' | 'number';
  placeholder: string;
  defaultValue: string | number;
  presets: (string | number)[];
}

export interface ObjectInstance {
  id: string;
  varName: string;
  address: string;
  className: string;
  attrs: Record<string, string | number>;
  lastAction?: string;
}

export interface BlueprintMethod {
  name: string;
  label: string;
  callSignature: string;
  description: string;
  execute: (instance: ObjectInstance) => {
    updatedAttrs: Record<string, string | number>;
    consoleOutput: string;
    statusType: 'nominal' | 'warning';
  };
}

export interface BlueprintTemplate {
  id: 'Pet' | 'BankAccount' | 'Hero';
  title: string;
  subtitle: string;
  className: string;
  varPrefix: string;
  fields: BlueprintField[];
  defaultAttrs: Record<string, string | number>;
  meterKey?: {
    key: string;
    label: string;
    max: number;
    unit: string;
  };
  methods: BlueprintMethod[];
  codeLines: string[];
  initialInstances: Omit<ObjectInstance, 'lastAction'>[];
}

export const BLUEPRINT_TEMPLATES: BlueprintTemplate[] = [
  {
    id: 'Pet',
    title: 'Pet 寵物藍圖',
    subtitle: '最適合第一次接觸物件導向的例子：每隻寵物都有名字、體力與專屬動作。',
    className: 'Pet',
    varPrefix: 'pet',
    fields: [
      {
        key: 'name',
        label: '名字 (name)',
        type: 'text',
        placeholder: '例如：麻糬',
        defaultValue: '麻糬',
        presets: ['麻糬', '黑糖', '可樂', '布丁'],
      },
      {
        key: 'species',
        label: '品種 (species)',
        type: 'text',
        placeholder: '例如：柴犬',
        defaultValue: '柴犬',
        presets: ['柴犬', '橘貓', '柯基', '黃金獵犬'],
      },
    ],
    defaultAttrs: {
      energy: 100,
      mood: '開心',
    },
    meterKey: {
      key: 'energy',
      label: '體力值',
      max: 100,
      unit: '點',
    },
    methods: [
      {
        name: 'play',
        label: '玩耍 play()',
        callSignature: 'play()',
        description: '消耗 20 點體力，心情變成超興奮',
        execute: (inst) => {
          const currentEnergy = Number(inst.attrs.energy ?? 0);
          if (currentEnergy < 20) {
            return {
              updatedAttrs: { ...inst.attrs, mood: '好累' },
              consoleOutput: `${inst.attrs.name} 體力只剩 ${currentEnergy} 點，太累了，先餵食或休息吧！`,
              statusType: 'warning',
            };
          }
          const nextEnergy = currentEnergy - 20;
          return {
            updatedAttrs: {
              ...inst.attrs,
              energy: nextEnergy,
              mood: '超興奮',
            },
            consoleOutput: `${inst.attrs.name} 開心地追球玩耍！體力剩餘 ${nextEnergy} 點`,
            statusType: 'nominal',
          };
        },
      },
      {
        name: 'feed',
        label: '餵食 feed()',
        callSignature: 'feed()',
        description: '補充 25 點體力（上限 100），心情變成滿足',
        execute: (inst) => {
          const currentEnergy = Number(inst.attrs.energy ?? 0);
          const nextEnergy = Math.min(100, currentEnergy + 25);
          return {
            updatedAttrs: {
              ...inst.attrs,
              energy: nextEnergy,
              mood: '滿足',
            },
            consoleOutput: `${inst.attrs.name} 吃完了點心！體力恢復至 ${nextEnergy} 點`,
            statusType: 'nominal',
          };
        },
      },
      {
        name: 'sleep',
        label: '睡覺 sleep()',
        callSignature: 'sleep()',
        description: '將體力恢復到 100 點',
        execute: (inst) => ({
          updatedAttrs: {
            ...inst.attrs,
            energy: 100,
            mood: '精神飽滿',
          },
          consoleOutput: `${inst.attrs.name} 睡了一場好覺，體力回到 100 點！`,
          statusType: 'nominal',
        }),
      },
    ],
    codeLines: [
      'class Pet:',
      '    def __init__(self, name, species):',
      '        self.name = name',
      '        self.species = species',
      '        self.energy = 100',
      '        self.mood = "開心"',
      '',
      '    def play(self):',
      '        if self.energy >= 20:',
      '            self.energy -= 20',
      '            self.mood = "超興奮"',
      '            print(f"{self.name} 開心地追球玩耍！")',
      '        else:',
      '            print(f"{self.name} 太累了，需要先休息！")',
      '',
      '    def feed(self):',
      '        self.energy = min(100, self.energy + 25)',
      '        self.mood = "滿足"',
    ],
    initialInstances: [
      {
        id: 'pet-init-1',
        varName: 'pet1',
        address: '0x104A',
        className: 'Pet',
        attrs: { name: '麻糬', species: '柴犬', energy: 100, mood: '開心' },
      },
      {
        id: 'pet-init-2',
        varName: 'pet2',
        address: '0x208F',
        className: 'Pet',
        attrs: { name: '小橘', species: '橘貓', energy: 65, mood: '好奇' },
      },
    ],
  },
  {
    id: 'BankAccount',
    title: 'BankAccount 銀行帳戶',
    subtitle: '體驗物件如何安全封裝資料：提款方法會先檢查餘額，避免出現負數。',
    className: 'BankAccount',
    varPrefix: 'acc',
    fields: [
      {
        key: 'owner',
        label: '戶名 (owner)',
        type: 'text',
        placeholder: '例如：林小美',
        defaultValue: '林小美',
        presets: ['林小美', '陳阿明', '張子晴'],
      },
      {
        key: 'balance',
        label: '初始餘額 (balance)',
        type: 'number',
        placeholder: '例如：1000',
        defaultValue: 1000,
        presets: [1000, 2500, 500],
      },
    ],
    defaultAttrs: {
      status: '正常啟用',
    },
    meterKey: {
      key: 'balance',
      label: '帳戶餘額',
      max: 5000,
      unit: '元',
    },
    methods: [
      {
        name: 'deposit',
        label: '存款 deposit(500)',
        callSignature: 'deposit(500)',
        description: '存入 500 元到該物件自己的 balance 屬性',
        execute: (inst) => {
          const next = Number(inst.attrs.balance ?? 0) + 500;
          return {
            updatedAttrs: { ...inst.attrs, balance: next },
            consoleOutput: `[${inst.attrs.owner}] 存入 500 元成功，目前餘額：${next} 元`,
            statusType: 'nominal',
          };
        },
      },
      {
        name: 'withdraw',
        label: '提款 withdraw(300)',
        callSignature: 'withdraw(300)',
        description: '檢查餘額是否足夠 300 元，足夠才扣款',
        execute: (inst) => {
          const current = Number(inst.attrs.balance ?? 0);
          if (current < 300) {
            return {
              updatedAttrs: inst.attrs,
              consoleOutput: `[${inst.attrs.owner}] 提款失敗：餘額僅 ${current} 元，不足 300 元`,
              statusType: 'warning',
            };
          }
          const next = current - 300;
          return {
            updatedAttrs: { ...inst.attrs, balance: next },
            consoleOutput: `[${inst.attrs.owner}] 提款 300 元成功，剩餘餘額：${next} 元`,
            statusType: 'nominal',
          };
        },
      },
      {
        name: 'check',
        label: '查詢 check()',
        callSignature: 'check()',
        description: '讀取目前帳戶擁有人與餘額',
        execute: (inst) => ({
          updatedAttrs: inst.attrs,
          consoleOutput: `帳戶持有人：${inst.attrs.owner}｜目前餘額：${inst.attrs.balance} 元`,
          statusType: 'nominal',
        }),
      },
    ],
    codeLines: [
      'class BankAccount:',
      '    def __init__(self, owner, balance):',
      '        self.owner = owner',
      '        self.balance = balance',
      '        self.status = "正常啟用"',
      '',
      '    def deposit(self, amount):',
      '        self.balance += amount',
      '        print(f"[{self.owner}] 存入 {amount} 元")',
      '',
      '    def withdraw(self, amount):',
      '        if self.balance >= amount:',
      '            self.balance -= amount',
      '            print(f"[{self.owner}] 提款 {amount} 元成功")',
      '        else:',
      '            print(f"[{self.owner}] 餘額不足！")',
    ],
    initialInstances: [
      {
        id: 'acc-init-1',
        varName: 'acc1',
        address: '0x3B12',
        className: 'BankAccount',
        attrs: { owner: '林小美', balance: 1500, status: '正常啟用' },
      },
      {
        id: 'acc-init-2',
        varName: 'acc2',
        address: '0x4C90',
        className: 'BankAccount',
        attrs: { owner: '陳阿明', balance: 400, status: '正常啟用' },
      },
    ],
  },
  {
    id: 'Hero',
    title: 'Hero 冒險勇者',
    subtitle: '遊戲角色最常用類別實作：不同角色共用同一套技能邏輯，但數值各自獨立。',
    className: 'Hero',
    varPrefix: 'hero',
    fields: [
      {
        key: 'name',
        label: '角色名稱 (name)',
        type: 'text',
        placeholder: '例如：艾倫',
        defaultValue: '艾倫',
        presets: ['艾倫', '莉娜', '凱文'],
      },
      {
        key: 'role',
        label: '職業 (role)',
        type: 'text',
        placeholder: '例如：劍士',
        defaultValue: '劍士',
        presets: ['劍士', '法師', '弓箭手'],
      },
    ],
    defaultAttrs: {
      level: 1,
      hp: 100,
    },
    meterKey: {
      key: 'hp',
      label: '生命值 HP',
      max: 100,
      unit: 'HP',
    },
    methods: [
      {
        name: 'train',
        label: '修煉 train()',
        callSignature: 'train()',
        description: '等級 +1，但需要消耗 15 HP',
        execute: (inst) => {
          const hp = Number(inst.attrs.hp ?? 0);
          const level = Number(inst.attrs.level ?? 1);
          if (hp <= 15) {
            return {
              updatedAttrs: inst.attrs,
              consoleOutput: `${inst.attrs.name} 生命值過低 (${hp} HP)，無法修煉，請先治療！`,
              statusType: 'warning',
            };
          }
          return {
            updatedAttrs: { ...inst.attrs, level: level + 1, hp: hp - 15 },
            consoleOutput: `${inst.attrs.name} 完成修煉！升到 Lv.${level + 1}（HP 剩餘 ${hp - 15}）`,
            statusType: 'nominal',
          };
        },
      },
      {
        name: 'heal',
        label: '治療 heal()',
        callSignature: 'heal()',
        description: '回復 30 HP（最高不超過 100）',
        execute: (inst) => {
          const nextHp = Math.min(100, Number(inst.attrs.hp ?? 0) + 30);
          return {
            updatedAttrs: { ...inst.attrs, hp: nextHp },
            consoleOutput: `${inst.attrs.name} 使用治癒藥水，HP 回復至 ${nextHp}`,
            statusType: 'nominal',
          };
        },
      },
      {
        name: 'greet',
        label: '宣告 greet()',
        callSignature: 'greet()',
        description: '輸出角色自我介紹',
        execute: (inst) => ({
          updatedAttrs: inst.attrs,
          consoleOutput: `「我是 Lv.${inst.attrs.level} 的${inst.attrs.role} ${inst.attrs.name}！」`,
          statusType: 'nominal',
        }),
      },
    ],
    codeLines: [
      'class Hero:',
      '    def __init__(self, name, role):',
      '        self.name = name',
      '        self.role = role',
      '        self.level = 1',
      '        self.hp = 100',
      '',
      '    def train(self):',
      '        if self.hp > 15:',
      '            self.level += 1',
      '            self.hp -= 15',
      '            print(f"{self.name} 升到 Lv.{self.level}！")',
      '        else:',
      '            print(f"{self.name} HP 過低，請先治療！")',
      '',
      '    def heal(self):',
      '        self.hp = min(100, self.hp + 30)',
    ],
    initialInstances: [
      {
        id: 'hero-init-1',
        varName: 'hero1',
        address: '0x7A01',
        className: 'Hero',
        attrs: { name: '艾倫', role: '劍士', level: 2, hp: 85 },
      },
      {
        id: 'hero-init-2',
        varName: 'hero2',
        address: '0x8E44',
        className: 'Hero',
        attrs: { name: '莉娜', role: '法師', level: 1, hp: 100 },
      },
    ],
  },
];

export interface StepperState {
  stepIndex: number;
  activeLine: number;
  title: string;
  explanation: string;
  selfTarget: 'none' | 'pet1' | 'pet2';
  blueprintLoaded: boolean;
  pet1: { exists: boolean; name?: string; species?: string; energy?: number };
  pet2: { exists: boolean; name?: string; species?: string; energy?: number };
  consoleLines: string[];
}

export const STEPPER_CODE_LINES = [
  'class Pet:',
  '    def __init__(self, name, species):',
  '        self.name = name',
  '        self.species = species',
  '        self.energy = 100',
  '',
  '    def greet(self):',
  '        print(f"你好！我是 {self.name} ({self.species})")',
  '',
  'pet1 = Pet("麻糬", "柴犬")',
  'pet2 = Pet("黑糖", "柯基")',
  'pet1.greet()',
  'pet2.greet()',
];

export const SELF_STEPPER_STEPS: StepperState[] = [
  {
    stepIndex: 0,
    activeLine: 1,
    title: '步驟 1：定義類別藍圖 (class Pet)',
    explanation:
      'Python 先讀取 class Pet 區塊，在腦海中記住「寵物藍圖」有哪些欄位與方法。此時還沒有任何實體寵物誕生。',
    selfTarget: 'none',
    blueprintLoaded: true,
    pet1: { exists: false },
    pet2: { exists: false },
    consoleLines: [],
  },
  {
    stepIndex: 1,
    activeLine: 10,
    title: '步驟 2：呼叫 Pet("麻糬", "柴犬") 建立物件',
    explanation:
      '看到類別名稱加上括號 ()，Python 會在記憶體中闢出一個全新空間 (0x104A) 給 pet1，並自動呼叫 __init__ 方法。',
    selfTarget: 'pet1',
    blueprintLoaded: true,
    pet1: { exists: true },
    pet2: { exists: false },
    consoleLines: [],
  },
  {
    stepIndex: 2,
    activeLine: 2,
    title: '步驟 3：self 自動指向剛建立的 pet1',
    explanation:
      '__init__ 的第一個參數 self 不需要自己傳！Python 自動把 0x104A 交給 self，並把 "麻糬" 給 name、"柴犬" 給 species。',
    selfTarget: 'pet1',
    blueprintLoaded: true,
    pet1: { exists: true },
    pet2: { exists: false },
    consoleLines: [],
  },
  {
    stepIndex: 3,
    activeLine: 3,
    title: '步驟 4：將屬性寫入 pet1 自己的記憶體箱子',
    explanation:
      '執行 self.name = name、self.species = species 與 self.energy = 100。因為 self 此刻代表 0x104A，所以資料全數存進 pet1！',
    selfTarget: 'pet1',
    blueprintLoaded: true,
    pet1: { exists: true, name: '麻糬', species: '柴犬', energy: 100 },
    pet2: { exists: false },
    consoleLines: [],
  },
  {
    stepIndex: 4,
    activeLine: 11,
    title: '步驟 5：用同一份藍圖建立第二個物件 pet2',
    explanation:
      '再次呼叫 Pet("黑糖", "柯基")。Python 另闢一塊獨立記憶體 (0x208F)，這次 self 自動改指向 pet2，完全不會蓋掉 pet1 的資料。',
    selfTarget: 'pet2',
    blueprintLoaded: true,
    pet1: { exists: true, name: '麻糬', species: '柴犬', energy: 100 },
    pet2: { exists: true, name: '黑糖', species: '柯基', energy: 100 },
    consoleLines: [],
  },
  {
    stepIndex: 5,
    activeLine: 12,
    title: '步驟 6：呼叫 pet1.greet()，self 指向 pet1',
    explanation:
      '寫 pet1.greet() 時，Python 背後其實是執行 Pet.greet(pet1)。所以 greet() 裡的 self.name 會讀到 "麻糬"！',
    selfTarget: 'pet1',
    blueprintLoaded: true,
    pet1: { exists: true, name: '麻糬', species: '柴犬', energy: 100 },
    pet2: { exists: true, name: '黑糖', species: '柯基', energy: 100 },
    consoleLines: ['你好！我是 麻糬 (柴犬)'],
  },
  {
    stepIndex: 6,
    activeLine: 13,
    title: '步驟 7：呼叫 pet2.greet()，self 改指向 pet2',
    explanation:
      '換成 pet2.greet() 時，同一個 greet 方法裡的 self 自動切換成 0x208F，於是讀出 "黑糖"。這就是 self 的魔法！',
    selfTarget: 'pet2',
    blueprintLoaded: true,
    pet1: { exists: true, name: '麻糬', species: '柴犬', energy: 100 },
    pet2: { exists: true, name: '黑糖', species: '柯基', energy: 100 },
    consoleLines: ['你好！我是 麻糬 (柴犬)', '你好！我是 黑糖 (柯基)'],
  },
];

export interface SandboxPreset {
  id: string;
  label: string;
  description: string;
  code: string;
}

export const SANDBOX_PRESETS: SandboxPreset[] = [
  {
    id: 'pet-basic',
    label: '基礎：寵物類別',
    description: '試著修改寵物的名字、增加第 3 隻寵物，或呼叫多次 play() 觀察體力變化。',
    code: `class Pet:
    def __init__(self, name, species):
        self.name = name
        self.species = species
        self.energy = 100

    def play(self):
        if self.energy >= 20:
            self.energy -= 20
            print(f"{self.name} 玩得超開心！體力剩下 {self.energy}")
        else:
            print(f"{self.name} 太累了，需要先休息")

    def feed(self):
        self.energy = min(100, self.energy + 30)
        print(f"{self.name} 吃完點心，體力恢復到 {self.energy}")

dog = Pet("麻糬", "柴犬")
cat = Pet("小橘", "橘貓")

dog.play()
dog.play()
cat.feed()
print("狗的品種是：", dog.species)`,
  },
  {
    id: 'book-practice',
    label: '練習：Book 書籍',
    description: '設計一個書籍類別，包含書名、作者與目前頁數，練習撰寫翻頁方法 read(pages)。',
    code: `class Book:
    def __init__(self, title, author, total_pages):
        self.title = title
        self.author = author
        self.total_pages = total_pages
        self.current_page = 0

    def read(self, pages):
        self.current_page = min(self.total_pages, self.current_page + pages)
        print(f"正在閱讀《{self.title}》，進度：{self.current_page}/{self.total_pages} 頁")

b1 = Book("Python 初學指南", "林大明", 240)
b2 = Book("演算法圖鑑", "陳小華", 180)

b1.read(35)
b1.read(50)
b2.read(20)`,
  },
  {
    id: 'vending-challenge',
    label: '挑戰：自動販賣機',
    description: '結合條件判斷 if/else，確保投幣金額足夠與庫存大於 0 時才能購買飲料。',
    code: `class VendingMachine:
    def __init__(self, drink_name, price, stock):
        self.drink_name = drink_name
        self.price = price
        self.stock = stock
        self.coins = 0

    def insert_coin(self, amount):
        self.coins += amount
        print(f"已投入 {amount} 元，目前餘額：{self.coins} 元")

    def buy(self):
        if self.stock <= 0:
            print("抱歉，飲料已售完！")
        else:
            if self.coins >= self.price:
                self.coins -= self.price
                self.stock -= 1
                print(f"購買成功！獲得 {self.drink_name}，剩餘零錢 {self.coins} 元")
            else:
                print(f"金額不足，還差 {self.price - self.coins} 元")

vm = VendingMachine("烏龍茶", 25, 3)
vm.insert_coin(10)
vm.buy()
vm.insert_coin(20)
vm.buy()`,
  },
];

export interface QuizQuestion {
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '在 Python 中，「類別 (Class)」與「物件 (Object)」的關係最接近下列哪一種比喻？',
    options: [
      '類別是已經蓋好的房子，物件是建築藍圖',
      '類別是建築藍圖（設計規格），物件是依照藍圖蓋出來的每一棟真實房子',
      '類別是儲存數字的列表，物件是迴圈語法',
      '兩者完全相同，只是寫法不同而已',
    ],
    correctIndex: 1,
    explanation:
      '類別 (class) 定義了屬性與方法的藍圖；每呼叫一次類別名稱（如 Pet("麻糬")），就會根據藍圖建立一個獨立的物件實體 (object / instance)。',
  },
  {
    id: 2,
    question: '在類別中定義的 __init__ 方法，會在什麼時機自動被執行？',
    codeSnippet: `class Student:\n    def __init__(self, name):\n        self.name = name\n\ns1 = Student("小華")`,
    options: [
      '每次修改 s1.name 屬性時都會自動執行',
      '只有寫成 s1.__init__() 時才會執行',
      '當我們使用 Student("小華") 建立新物件時，Python 會自動呼叫它來初始化屬性',
      '當程式結束關閉時才會執行',
    ],
    correctIndex: 2,
    explanation:
      '__init__ 是建構子（初始化方法）。只要執行 ClassName(...) 建立新物件，Python 就會自動呼叫 __init__，幫新物件設定最初的屬性值。',
  },
  {
    id: 3,
    question: '方法定義裡的第一個參數 self 代表什麼意思？',
    codeSnippet: `def bark(self):\n    print(f"{self.name} 汪了一聲！")`,
    options: [
      '代表「正在呼叫這個方法的那一個物件本身」',
      '代表整個 Python 程式檔案',
      '代表所有已經建立過的物件總和',
      '是一個固定的關鍵字，沒有任何實際用途，不能改名',
    ],
    correctIndex: 0,
    explanation:
      '當我們執行 dog1.bark() 時，Python 會自動把 dog1 傳進第一個參數 self；執行 dog2.bark() 時，self 就變成 dog2，讓方法知道要存取哪個物件的資料。',
  },
  {
    id: 4,
    question: '執行下方程式碼後，最後一行 print(cat2.age) 會印出什麼結果？',
    codeSnippet: `class Cat:\n    def __init__(self, age):\n        self.age = age\n\ncat1 = Cat(2)\ncat2 = Cat(5)\ncat1.age = 10\nprint(cat2.age)`,
    options: ['2', '5', '10', '程式會發生錯誤'],
    correctIndex: 1,
    explanation:
      'cat1 與 cat2 是兩個擁有各自記憶體空間的獨立物件。修改 cat1.age = 10 只會改動 cat1 的屬性，cat2.age 依然維持原本的 5！',
  },
  {
    id: 5,
    question: '在物件導向語法中，下列哪一個敘述正確區分了「屬性 (Attribute)」與「方法 (Method)」？',
    options: [
      '屬性後面一定有小括號 ()，方法後面沒有括號',
      '屬性用來儲存物件的資料（如 dog.name），方法則是物件能執行的動作函式（如 dog.play()）',
      '屬性只能是數字，方法只能是文字',
      '類別裡只能有屬性，不能有方法',
    ],
    correctIndex: 1,
    explanation:
      '屬性 (Attribute) 是綁在物件上的變數資料（例如 self.name、self.energy）；方法 (Method) 是定義在類別內的函式，呼叫時需加上括號（例如 dog.play()）。',
  },
];
