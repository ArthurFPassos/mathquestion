# 🧮 MathQuestion

Plataforma educacional de exercícios de matemática para o 6º ano do Ensino Fundamental.

## Estrutura do projeto

```
src/
├── components/
│   ├── WelcomeScreen.jsx     — Tela inicial com nome do aluno
│   ├── DiagnosticScreen.jsx  — RF01: Avaliação diagnóstica
│   ├── DemoScreen.jsx        — RF02: Demonstração instrucional (obrigatória)
│   ├── QuizEngine.jsx        — RF03–RF07, RF14, RF15: Motor de questões
│   ├── Dashboard.jsx         — RF08–RF12: Painel de progresso
│   └── Scratchpad.jsx        — RF14: Rascunho em canvas
├── context/
│   └── AppContext.jsx        — Estado global (useReducer + Context API)
├── data/
│   └── units.js              — Banco de questões das 4 unidades
├── utilis/
│   └── helpers.js            — Funções puras (progresso, XP, relatório)
├── App.jsx                   — Roteador de telas
├── main.jsx                  — Entry point
├── index.css                 — Reset global
└── App.css                   — Overrides globais
```

## Como rodar

```bash
npm install
npm run dev
```

## Requisitos funcionais implementados

| RF   | Descrição                        | Arquivo                        |
|------|----------------------------------|--------------------------------|
| RF01 | Avaliação diagnóstica            | DiagnosticScreen.jsx           |
| RF02 | Demo obrigatória antes do quiz   | DemoScreen.jsx                 |
| RF03 | Questões de múltipla escolha     | QuizEngine.jsx                 |
| RF04 | Problemas contextualizados       | units.js + QuizEngine.jsx      |
| RF05 | Feedback visual verde/vermelho   | QuizEngine.jsx                 |
| RF06 | Dica na segunda tentativa        | QuizEngine.jsx                 |
| RF07 | XP com bônus sem dica            | QuizEngine.jsx + AppContext    |
| RF08 | Bloqueio de unidades (80%)       | helpers.js + Dashboard.jsx     |
| RF09 | Dashboard com progresso          | Dashboard.jsx                  |
| RF10 | Download relatório JSON          | helpers.js + Dashboard.jsx     |
| RF11 | Finalização com média ≥ 90%      | Dashboard.jsx                  |
| RF12 | Refazer módulo (melhora média)   | Dashboard.jsx + AppContext     |
| RF14 | Rascunho canvas                  | Scratchpad.jsx                 |
| RF15 | Limite de 3 dicas por bateria    | AppContext.jsx + QuizEngine    |
