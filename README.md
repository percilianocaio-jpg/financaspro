# FinançasPRO 💰

App de planejamento financeiro pessoal com React + Node.js + MongoDB.

## Funcionalidades

- ✅ Autenticação (registro / login com JWT)
- ✅ Lançamentos (entradas e saídas com categorias detalhadas)
- ✅ Despesas fixas mensais com controle de vencimento
- ✅ Lançamentos futuros (previstos)
- ✅ Controle de dívidas e cartões com taxa de juros
- ✅ Dashboard com gráficos e métricas
- ✅ Destaques: maior entrada, maior gasto, maior taxa de juros, maior dívida
- ✅ Insights automáticos com regra 50-30-20
- ✅ Comprometimento de renda por categoria

## Tecnologias

**Frontend:** React 18, React Router, Chart.js, Axios  
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs

---

## Como rodar

### Pré-requisitos
- Node.js 18+
- MongoDB (local ou MongoDB Atlas)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite o .env com suas configurações
npm run dev
```

O servidor sobe em `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

O app abre em `http://localhost:3000`

---

## Variáveis de ambiente (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/financaspro
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d
```

> Para usar o MongoDB Atlas, substitua MONGO_URI pela sua connection string.

---

## Estrutura do projeto

```
financaspro/
├── backend/
│   ├── middleware/
│   │   └── auth.js           # Middleware JWT
│   ├── models/
│   │   ├── User.js            # Usuário
│   │   ├── Transaction.js     # Lançamentos
│   │   ├── FixedExpense.js    # Despesas fixas
│   │   ├── FutureEntry.js     # Lançamentos futuros
│   │   └── Debt.js            # Dívidas/cartões
│   ├── routes/
│   │   ├── auth.js            # POST /register, /login, GET /me
│   │   ├── transactions.js    # CRUD de lançamentos
│   │   ├── fixed.js           # CRUD de fixas
│   │   ├── future.js          # CRUD de futuros
│   │   ├── debts.js           # CRUD de dívidas
│   │   └── summary.js         # Dashboard agregado
│   └── server.js
│
└── frontend/
    └── src/
        ├── context/
        │   ├── AuthContext.jsx    # Estado de autenticação
        │   └── FinanceContext.jsx # Estado financeiro global
        ├── utils/
        │   ├── api.js             # Axios configurado
        │   └── formatters.js      # Moeda, datas, categorias
        ├── components/
        │   ├── layout/
        │   │   └── Sidebar.jsx
        │   └── shared/
        │       └── EntryModal.jsx # Modal universal de lançamento
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── Transactions.jsx
        │   ├── Fixed.jsx
        │   ├── Future.jsx
        │   ├── Debts.jsx
        │   └── Insights.jsx
        └── App.jsx
```

---

## API endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Criar conta |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Dados do usuário logado |
| GET | /api/summary | Dashboard resumido |
| GET/POST | /api/transactions | Lançamentos |
| PUT/DELETE | /api/transactions/:id | Editar/remover |
| GET/POST | /api/fixed | Despesas fixas |
| GET/POST | /api/future | Futuros |
| PATCH | /api/future/:id/realize | Marcar como realizado |
| GET/POST | /api/debts | Dívidas |

---

## Próximos passos sugeridos

- [ ] Edição de lançamentos (não só exclusão)
- [ ] Filtro por período no dashboard
- [ ] Gráfico de evolução mensal (6 meses)
- [ ] Exportar relatório PDF
- [ ] Metas de economia
- [ ] Deploy: frontend no Vercel, backend no Render, banco no MongoDB Atlas

---

## Autor

**Caio Perciliano**

🔗 GitHub:[(https://github.com/percilianocaio-jpg)]
🔗 Email: percilianocaio@gmail.com
# financaspro
