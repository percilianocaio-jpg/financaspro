import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Login() {
  const { login, register, loading, error, setError } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async () => {
    const ok = isRegister
      ? await register(form.name, form.email, form.password)
      : await login(form.email, form.password);
    if (ok) navigate('/');
  };

  return (
    <div className="auth-page">
      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="theme-toggle"
        style={{ position: 'fixed', top: 20, right: 20 }}
      >
        <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} />
        {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
      </button>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <i className="ti ti-chart-line" />
          </div>
          <h1 className="auth-title">FinançasPRO</h1>
          <p className="auth-sub">{isRegister ? 'Crie sua conta gratuita' : 'Acesse sua conta'}</p>
        </div>

        {isRegister && (
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input className="form-control" placeholder="Seu nome" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">E-mail</label>
          <input className="form-control" type="email" placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Senha</label>
          <input
            className="form-control" type="password" placeholder="••••••"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(217,95,59,0.1)', border: '1px solid rgba(217,95,59,0.2)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 13, color: 'var(--negative)', marginBottom: 14 }}>
            <i className="ti ti-alert-circle" style={{ marginRight: 6 }} />{error}
          </div>
        )}

        <button
          className="btn btn-gold"
          style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 14 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Aguarde...</>
            : isRegister ? 'Criar conta' : 'Entrar'
          }
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, marginTop: 18, color: 'var(--text-muted)' }}>
          {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <button
            style={{ background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 500, cursor: 'pointer', fontSize: 13 }}
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'Entrar' : 'Criar conta'}
          </button>
        </p>
      </div>
    </div>
  );
}