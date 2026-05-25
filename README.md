# MathQuestion

Plataforma educacional web para exercitação de matemática voltada a alunos do 5.º e 6.º ano do Ensino Fundamental. Desenvolvida como projeto acadêmico na Escola Superior de Tecnologia da Universidade do Estado do Amazonas (EST/UEA).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 5 |
| Roteamento | React Router DOM v6 |
| Estado global | Context API + useReducer |
| Banco de dados | Firebase Firestore |
| Autenticação | Firebase Auth (e-mail/senha) |
| Drag & Drop | @dnd-kit/core + sortable |
| Relatórios PDF | jsPDF + jspdf-autotable |
| Rascunho | Canvas API nativo |

## Como rodar

```bash
# Entrar na pasta correta (há duas pastas aninhadas)
cd mathquestion-main/mathquestion

npm install
npm run dev
```

> **Atenção:** o `package.json` fica em `mathquestion-main/mathquestion/`, não na raiz do zip extraído.

## Estrutura do projeto

```
mathquestion/
└── src/
    ├── assets/                         — Ícones PNG do Dashboard
    │   ├── xp.png
    │   ├── progresso.png
    │   ├── questao.png
    │   ├── relogio.png
    │   ├── revisao.png
    │   └── calculadora.png
    │
    ├── components/shared/
    │   ├── Navbar.jsx / .css           — Barra de navegação (RNF05)
    │   ├── Scratchpad.jsx / .css       — Canvas de rascunho + histórico (RF13)
    │   └── ExitModal.jsx / .css        — Modal de confirmação de saída (RNF08/09)
    │
    ├── context/
    │   └── AppContext.jsx              — Estado global (useReducer + useEffect)
    │
    ├── data/
    │   └── units.js                   — Banco de questões das 4 unidades
    │
    ├── pages/
    │   ├── auth/
    │   │   ├── Login.jsx / .css        — Autenticação (aluno e professor)
    │   │   └── Register.jsx / .css     — Cadastro com seleção de perfil (RF19)
    │   │
    │   ├── public/
    │   │   ├── Home.jsx / .css         — Página inicial
    │   │   └── Sobre.jsx / .css        — Sobre o projeto
    │   │
    │   ├── diagnostic/
    │   │   ├── DiagnosticScreen.jsx / .css        — 1.º Diagnóstico (RF01)
    │   │   ├── ReviewScreen.jsx / .css            — Revisão de conteúdo (RF15/RF16)
    │   │   └── SecondDiagnosticScreen.jsx / .css  — 2.º Diagnóstico (RF17)
    │   │
    │   ├── student/
    │   │   ├── Dashboard.jsx / .css    — Painel do aluno (RF08/RF09/RF11/RF23)
    │   │   ├── DemoScreen.jsx / .css   — Demonstração obrigatória (RF02)
    │   │   ├── QuizEngine.jsx / .css   — Motor de questões (RF03–RF07/RF13/RF14/RF18)
    │   │   └── WelcomeScreen.jsx / .css
    │   │
    │   └── teacher/
    │       └── TeacherDashboard.jsx / .css  — Painel do professor (RF19–RF22)
    │
    ├── services/
    │   ├── firebaseConfig.js           — Inicialização do Firebase
    │   ├── firebaseService.js          — Todas as operações Firestore/Auth
    │   ├── helpers.js                  — Funções puras (progresso, XP, tempo)
    │   └── moduleReportService.js      — Geração de PDF por módulo (RF18)
    │
    ├── utilis/
    │   └── helpers.js                 — Helpers legados (mantido por compatibilidade)
    │
    ├── App.jsx                        — Roteador principal (BrowserRouter)
    ├── App.css
    ├── main.jsx                       — Entry point
    └── index.css                      — Reset e estilos globais
```

## Rotas

| Rota | Acesso | Componente |
|---|---|---|
| `/` | Público | `Home` |
| `/login` | Público | `Login` |
| `/cadastro` | Público | `Register` |
| `/sobre` | Público | `Sobre` |
| `/diagnostico` | Aluno autenticado | `DiagnosticScreen` |
| `/revisao` | Aluno autenticado | `ReviewScreen` |
| `/segundo-diagnostico` | Aluno autenticado | `SecondDiagnosticScreen` |
| `/dashboard` | Aluno autenticado | `Dashboard` / `DemoScreen` / `QuizEngine` |
| `/modulo-1` | Aluno autenticado | `Dashboard` / `DemoScreen` / `QuizEngine` |
| `/teacher-dashboard` | Professor autenticado | `TeacherDashboard` |

## Coleções Firestore

| Coleção | Descrição |
|---|---|
| `students/{uid}` | Perfil do aluno |
| `students/{uid}/modules/{id}` | Resultado por módulo padrão |
| `students/{uid}/diagnostics/{n}` | Resultados diagnósticos |
| `users/{uid}` | Perfil do professor |
| `users/{uid}/modules/{code}` | Índice dos módulos criados |
| `users/{uid}/extraModules/{code}` | Módulos extras adicionados pelo aluno |
| `modules/{code}` | Módulo criado pelo professor (questões, dicas, maxAttempts) |
| `student_attempts/{id}` | Tentativa do aluno em módulo do professor |
| `student_attempts/{id}/history/{autoId}` | Histórico imutável de retentativas |

## Requisitos funcionais implementados

| RF | Descrição | Arquivo principal |
|---|---|---|
| RF01 | Avaliação diagnóstica inicial | `DiagnosticScreen.jsx` |
| RF02 | Demonstração obrigatória antes do quiz | `DemoScreen.jsx` |
| RF03 | Questões de múltipla escolha (4 alternativas) | `QuizEngine.jsx` |
| RF04 | Feedback visual imediato (✓/✗ + cor) | `QuizEngine.jsx` |
| RF05 | Dica exibida na 2.ª tentativa | `QuizEngine.jsx` |
| RF06 | XP com bônus para acertos sem dica | `QuizEngine.jsx` + `AppContext.jsx` |
| RF07 | Bloqueio de unidades (≥ 80% de acertos) | `helpers.js` + `Dashboard.jsx` |
| RF08 | Dashboard com progresso do aluno | `Dashboard.jsx` |
| RF09 | Download de relatório PDF geral | `helpers.js` + `Dashboard.jsx` |
| RF10 | Mensagem de finalização (média ≥ 90%) | `Dashboard.jsx` |
| RF11 | Refazer módulo concluído (melhora média) | `Dashboard.jsx` + `AppContext.jsx` |
| RF13 | Rascunho livre em canvas | `Scratchpad.jsx` |
| RF14 | Limite de 3 dicas por bateria | `AppContext.jsx` + `QuizEngine.jsx` |
| RF15 | Redirecionamento para revisão (< 60% no diagnóstico) | `DiagnosticScreen.jsx` |
| RF16 | Tela de revisão de conteúdo | `ReviewScreen.jsx` |
| RF17 | 2.º Diagnóstico após revisão | `SecondDiagnosticScreen.jsx` |
| RF18 | Relatório detalhado por módulo (PDF com rascunhos) | `QuizEngine.jsx` + `moduleReportService.js` |
| RF19 | Seleção de perfil no cadastro (aluno/professor) | `Register.jsx` |
| RF20 | Professor cria módulos personalizados | `TeacherDashboard.jsx` |
| RF21 | Template de criação (múltipla escolha + input + dica) | `TeacherDashboard.jsx` |
| RF22 | Monitoramento de alunos em tempo real (onSnapshot) | `TeacherDashboard.jsx` + `firebaseService.js` |
| RF23 | Aluno insere código de módulo extra | `Dashboard.jsx` |

## Requisitos não funcionais implementados

| RNF | Descrição | Onde |
|---|---|---|
| RNF01 | Firebase como banco de dados | `firebaseService.js` |
| RNF03 | Interface de baixa estimulação (fundo azul pastel, acessibilidade TDAH) | `TeacherDashboard.css` + `Dashboard.css` |
| RNF05 | Botão home / Navbar de retorno | `Navbar.jsx` |
| RNF06/07 | Questões e módulos armazenados no Firestore | `firebaseService.js` |
| RNF08 | Botão de saída nos exercícios | `QuizEngine.jsx` |
| RNF09 | Aviso de perda de progresso ao sair | `ExitModal.jsx` |
| RNF10 | Código de módulo com 2 números + 3 letras em posições aleatórias | `firebaseService.js` → `generateModuleCode()` |