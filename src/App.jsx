import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import { getRolePresentation } from './session.js';
import './styles.css';

function ProfileCard({ session, onLogout }) {
  const { user } = session;
  const role = getRolePresentation(user?.role || 'STUDENT');
  return (
    <section className="profile-card" aria-labelledby="profile-title" style={{ padding: '40px', maxWidth: '600px', margin: '40px auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
        <div className="avatar" aria-hidden="true" style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#1E3A8A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
          {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
        </div>
        <div>
          <p className="eyebrow" style={{ color: '#64748B', fontSize: '14px', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>Sesión activa</p>
          <h1 id="profile-title" style={{ margin: '5px 0', fontSize: '24px', color: '#0F172A' }}>{user?.firstName} {user?.lastName}</h1>
          <span className={`role-badge role-${(user?.role || '').toLowerCase()}`} style={{ background: '#E0F2FE', color: '#0284C7', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>{role?.label || user?.role}</span>
        </div>
      </header>
      <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div><dt style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>Correo</dt><dd style={{ margin: '4px 0 0', fontWeight: 500, color: '#0F172A' }}>{user?.email}</dd></div>
        <div><dt style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>Rol institucional</dt><dd style={{ margin: '4px 0 0', fontWeight: 500, color: '#0F172A' }}>{role?.description || 'Usuario'}</dd></div>
        <div><dt style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>Estado</dt><dd style={{ margin: '4px 0 0', fontWeight: 500, color: '#0F172A' }}><span className="status-dot" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', marginRight: '8px' }} />{user?.status === 'ACTIVE' ? 'Activo' : (user?.status || 'Activo')}</dd></div>
      </dl>
      <p className="privacy-note" style={{ color: '#94A3B8', fontSize: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '20px', marginBottom: '20px' }}>La credencial de acceso permanece únicamente en memoria y nunca se muestra en pantalla.</p>
      <button className="logout" type="button" onClick={onLogout} style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar sesión</button>
    </section>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setSession({ user: JSON.parse(storedUser) });
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setSession(null);
  };

  return session ? <ProfileCard session={session} onLogout={handleLogout} /> : <Login />;
}
