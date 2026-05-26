import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/', icon: 'ti-layout-dashboard', label: 'Visão geral', end: true },
      { to: '/lancamentos', icon: 'ti-list-details', label: 'Lançamentos' },
      { to: '/fixas', icon: 'ti-repeat', label: 'Despesas fixas' },
      { to: '/futuras', icon: 'ti-calendar-event', label: 'Futuras' },
    ],
  },
  {
    label: 'Patrimônio',
    items: [
      { to: '/dividas', icon: 'ti-credit-card', label: 'Dívidas' },
      { to: '/caixinhas', icon: 'ti-pig-money', label: 'Caixinhas' },
    ],
  },
  {
    label: 'Análise',
    items: [
      { to: '/insights', icon: 'ti-bulb', label: 'Insights' },
      { to: '/importar', icon: 'ti-upload', label: 'Importar extrato' },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo">
        <div className="logo-mark">
          <i className="ti ti-chart-line" />
        </div>
        <div>
          <div className="logo-text">FinançasPRO</div>
          <div className="logo-sub">Controle financeiro</div>
        </div>
      </div>

      {/* Nav */}
      {navGroups.map(group => (
        <div key={group.label}>
          <div className="nav-section">{group.label}</div>
          {group.items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <i className={`ti ${item.icon}`} />
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}

      {/* Bottom */}
      <div className="sidebar-bottom">
        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={toggle}
          style={{ width: '100%', marginBottom: 10, justifyContent: 'center' }}
        >
          <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} />
          {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        </button>

        {/* User */}
        <div className="user-row">
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            title="Sair"
          >
            <i className="ti ti-logout" style={{ fontSize: 15 }} />
          </button>
        </div>
      </div>
    </aside>
  );
}