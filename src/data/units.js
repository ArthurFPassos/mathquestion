export const UNITS = [
  {
    id: 1,
    title: "Revisão Geral",
    emoji: "🔢",
    color: "#6366f1",
    light: "#eef2ff",
    description: "Adição, subtração, multiplicação e divisão",
    modules: [
      {
        id: "1-1",
        title: "Adição e Subtração",
        questions: [
          {
            id: "q1",
            type: "multiple",
            statement:
              "Uma escola tem 348 alunos no turno da manhã e 275 no da tarde. Quantos alunos há ao total?",
            options: ["523", "623", "613", "723"],
            answer: "623",
            hint: "Some as centenas, dezenas e unidades separadamente: 300+200, 40+70, 8+5.",
            xp: 10,
          },
          {
            id: "q2",
            type: "input",
            statement:
              "Pedro tinha R$ 520 e gastou R$ 187 no mercado. Quanto dinheiro sobrou?",
            answer: "333",
            hint: "Subtraia começando pelas unidades. 520 - 187. Lembre de fazer o empréstimo.",
            xp: 10,
          },
          {
            id: "q3",
            type: "multiple",
            statement:
              "Numa viagem, o carro percorreu 412 km na ida e 398 km na volta. Quantos km foram ao total?",
            options: ["800", "810", "820", "830"],
            answer: "810",
            hint: "412 + 398 = 410 + 400 = ?",
            xp: 10,
          },
        ],
      },
      {
        id: "1-2",
        title: "Multiplicação e Divisão",
        questions: [
          {
            id: "q4",
            type: "multiple",
            statement:
              "Uma caixa tem 24 laranjas. Se temos 15 caixas, quantas laranjas temos no total?",
            options: ["320", "360", "340", "380"],
            answer: "360",
            hint: "Multiplique 24 × 15. Pense: 24 × 10 = 240 e 24 × 5 = 120.",
            xp: 10,
          },
          {
            id: "q5",
            type: "input",
            statement:
              "168 figurinhas devem ser divididas igualmente entre 8 crianças. Quantas cada uma recebe?",
            answer: "21",
            hint: "168 ÷ 8. Quantas vezes 8 cabe em 16? E em 8?",
            xp: 10,
          },
          {
            id: "q6",
            type: "multiple",
            statement:
              "Um fazendeiro colhe 45 kg de milho por dia. Em 12 dias, quantos kg ele colheu?",
            options: ["530", "540", "550", "560"],
            answer: "540",
            hint: "45 × 12. Tente 45 × 10 + 45 × 2.",
            xp: 10,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Potenciação",
    emoji: "⚡",
    color: "#f59e0b",
    light: "#fffbeb",
    description: "Introdução ao conceito de potência",
    modules: [
      {
        id: "2-1",
        title: "Bases e Expoentes",
        questions: [
          {
            id: "q7",
            type: "multiple",
            statement: "Quanto é 3² (3 ao quadrado)?",
            options: ["6", "9", "8", "12"],
            answer: "9",
            hint: "3² significa 3 × 3. Multiplique a base por ela mesma.",
            xp: 15,
          },
          {
            id: "q8",
            type: "input",
            statement: "Calcule 2⁵ (2 elevado à quinta potência).",
            answer: "32",
            hint: "2⁵ = 2×2×2×2×2. Vá multiplicando: 2, 4, 8, 16, 32.",
            xp: 15,
          },
          {
            id: "q9",
            type: "multiple",
            statement: "Qual é o valor de 5³?",
            options: ["125", "15", "115", "150"],
            answer: "125",
            hint: "5³ = 5 × 5 × 5. Primeiro 5×5=25, depois 25×5=?",
            xp: 15,
          },
        ],
      },
      {
        id: "2-2",
        title: "Propriedades da Potenciação",
        questions: [
          {
            id: "q10",
            type: "multiple",
            statement: "Todo número elevado a zero é igual a:",
            options: ["0", "1", "O próprio número", "Impossível"],
            answer: "1",
            hint: "Essa é uma regra especial: qualquer número (exceto zero) elevado a 0 = 1.",
            xp: 15,
          },
          {
            id: "q11",
            type: "input",
            statement: "Quanto vale 10⁴?",
            answer: "10000",
            hint: "10⁴ = 10 × 10 × 10 × 10. Para potências de 10, é só adicionar zeros!",
            xp: 15,
          },
          {
            id: "q12",
            type: "multiple",
            statement: "Se 4² = 16 e 4³ = 64, quanto é 4⁴?",
            options: ["128", "256", "512", "200"],
            answer: "256",
            hint: "4⁴ = 4³ × 4 = 64 × 4. Multiplique o resultado anterior por 4.",
            xp: 15,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Potenciação Avançada",
    emoji: "🚀",
    color: "#10b981",
    light: "#ecfdf5",
    description: "Potenciação aplicada + equações com múltiplos operadores",
    modules: [
      {
        id: "3-1",
        title: "Expressões com Potências",
        questions: [
          {
            id: "q13",
            type: "multiple",
            statement: "Resolva: 2³ + 4² − 5",
            options: ["19", "21", "23", "17"],
            answer: "19",
            hint: "Primeiro calcule as potências: 2³=8, 4²=16. Depois some e subtraia: 8+16-5.",
            xp: 20,
          },
          {
            id: "q14",
            type: "input",
            statement: "Calcule: 3² × 2³",
            answer: "72",
            hint: "3²=9, 2³=8. Agora multiplique os resultados: 9 × 8 = ?",
            xp: 20,
          },
          {
            id: "q15",
            type: "multiple",
            statement:
              "Numa construção, um andar quadrado mede 12 metros de lado. Qual é a área em m²?",
            options: ["48 m²", "144 m²", "124 m²", "24 m²"],
            answer: "144 m²",
            hint: "Área = lado². Então é 12² = 12 × 12.",
            xp: 20,
          },
        ],
      },
      {
        id: "3-2",
        title: "Ordem das Operações",
        questions: [
          {
            id: "q16",
            type: "multiple",
            statement: "Resolva: (3 + 2)² − 10",
            options: ["15", "25", "5", "20"],
            answer: "15",
            hint: "Parênteses primeiro: (3+2)=5. Depois a potência: 5²=25. Por fim: 25-10.",
            xp: 20,
          },
          {
            id: "q17",
            type: "input",
            statement: "Calcule: 4² + 3 × 5 − 2",
            answer: "29",
            hint: "Ordem: potência primeiro (4²=16), depois multiplicação (3×5=15), por fim: 16+15-2.",
            xp: 20,
          },
          {
            id: "q18",
            type: "multiple",
            statement: "Resolva: 2 × (5 + 1)² ÷ 4",
            options: ["18", "24", "12", "9"],
            answer: "18",
            hint: "(5+1)=6, 6²=36, 2×36=72, 72÷4=18.",
            xp: 20,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Frações",
    emoji: "🍕",
    color: "#ec4899",
    light: "#fdf2f8",
    description: "Adição e subtração de frações",
    modules: [
      {
        id: "4-1",
        title: "Frações de Mesmo Denominador",
        questions: [
          {
            id: "q19",
            type: "multiple",
            statement:
              "Maria comeu 2/8 da pizza e João comeu 3/8. Qual fração da pizza foi consumida?",
            options: ["4/8", "5/8", "6/8", "1/8"],
            answer: "5/8",
            hint: "Quando o denominador é igual, some só os numeradores: 2+3 = ? sobre 8.",
            xp: 25,
          },
          {
            id: "q20",
            type: "input",
            statement:
              "Numa receita, você usou 3/10 de xícara de açúcar e 4/10 de farinha. Quanto é isso junto? (escreva como n/d, ex: 7/10)",
            answer: "7/10",
            hint: "Somando frações de mesmo denominador: mantenha o denominador (10) e some os numeradores (3+4).",
            xp: 25,
          },
          {
            id: "q21",
            type: "multiple",
            statement:
              "Numa prova com 12 questões, Pedro acertou 9/12 e errou o restante. Qual fração ele errou?",
            options: ["2/12", "3/12", "4/12", "1/12"],
            answer: "3/12",
            hint: "Total = 12/12. Errou = 12/12 − 9/12. Subtraia os numeradores.",
            xp: 25,
          },
        ],
      },
      {
        id: "4-2",
        title: "Frações de Denominadores Diferentes",
        questions: [
          {
            id: "q22",
            type: "multiple",
            statement: "1/2 + 1/4 é igual a:",
            options: ["2/6", "3/4", "2/4", "1/3"],
            answer: "3/4",
            hint: "Converta 1/2 para quarto: 1/2 = 2/4. Agora some: 2/4 + 1/4 = ?",
            xp: 25,
          },
          {
            id: "q23",
            type: "input",
            statement:
              "Ana leu 1/3 de um livro ontem e 1/6 hoje. Que fração ela já leu? (escreva como n/d, ex: 1/2)",
            answer: "1/2",
            hint: "MMC(3,6)=6. 1/3=2/6. Então 2/6 + 1/6 = 3/6 = ?",
            xp: 25,
          },
          {
            id: "q24",
            type: "multiple",
            statement: "3/4 − 1/2 é igual a:",
            options: ["1/2", "2/2", "1/4", "2/4"],
            answer: "1/4",
            hint: "Converta 1/2 para quartos: 1/2 = 2/4. Agora: 3/4 − 2/4 = ?",
            xp: 25,
          },
        ],
      },
    ],
  },
];

export const DIAGNOSTIC = [
  {
    id: "d1",
    type: "multiple",
    statement: "Quanto é 15 × 4?",
    options: ["50", "60", "55", "65"],
    answer: "60",
  },
  {
    id: "d2",
    type: "multiple",
    statement: "Qual é o resultado de 100 − 37?",
    options: ["63", "73", "53", "67"],
    answer: "63",
  },
  {
    id: "d3",
    type: "multiple",
    statement: "Quanto é 72 ÷ 9?",
    options: ["7", "9", "8", "6"],
    answer: "8",
  },
];
