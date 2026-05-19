import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: '📊', label: 'Visão Geral', end: true },
  { to: '/lancamentos', icon: '📋', label: 'Lançamentos' },
  { to: '/fixas', icon: '🔁', label: 'Despesas Fixas' },
  { to: '/futuras', icon: '📅', label: 'Futuras' },
  { to: '/dividas', icon: '💳', label: 'Dívidas' },
  { to: '/insights', icon: '💡', label: 'Insights' },
  { to: '/importar', icon: '📂', label: 'Importar Extrato' },
  { to: '/caixinhas', icon: '🏦', label: 'Caixinhas' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon"><span>₿</span></div>
        <div>
          <div className="logo-text">FinançasPRO</div>
          <div className="logo-sub">Controle financeiro</div>
        </div>
      </div>

      <div className="nav-section">Menu</div>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      <div style={{ marginTop: 'auto' }}>
        <div className="divider" />
        <div style={{ padding: '8px 12px', marginBottom: '8px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{user?.email}</div>
        </div>
        <button className="nav-item" onClick={handleLogout}>
          <span className="nav-icon">🚪</span> Sair
        </button>
      </div>
    </aside>
  );
}
