import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Fixed from './pages/Fixed';
import Future from './pages/Future';
import Debts from './pages/Debts';
import Insights from './pages/Insights';
import Import from './pages/Import';
import Savings from './pages/Savings';
import Login from './pages/Login';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  return (
    <FinanceProvider>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lancamentos" element={<Transactions />} />
            <Route path="/fixas" element={<Fixed />} />
            <Route path="/futuras" element={<Future />} />
            <Route path="/dividas" element={<Debts />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/importar" element={<Import />} />
            <Route path="/caixinhas" element={<Savings />} />
          </Routes>
        </main>
      </div>
    </FinanceProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<PrivateRoute><AppLayout /></PrivateRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}