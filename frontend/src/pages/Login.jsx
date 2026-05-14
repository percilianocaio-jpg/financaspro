import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async () => {
    const ok = isRegister
      ? await register(form.name, form.email, form.password)
      : await login(form.email, form.password);
    if (ok) navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ width: 52, height: 52, background: 'var(--color-green)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>
            💰
          </div>
          <h1 className="auth-title">FinançasPRO</h1>
          <p className="auth-sub">{isRegister ? 'Crie sua conta gratuita' : 'Acesse sua conta'}</p>
        </div>

        {isRegister && (
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input className="form-control" placeholder="Seu nome" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">E-mail</label>
          <input className="form-control" type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Senha</label>
          <input
            className="form-control" type="password" placeholder="••••••"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <p style={{ color: 'var(--color-red)', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, marginTop: 16, color: 'var(--color-text-secondary)' }}>
          {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <button
            style={{ background: 'none', border: 'none', color: 'var(--color-green)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'Entrar' : 'Criar conta'}
          </button>
        </p>
      </div>
    </div>
  );
}
