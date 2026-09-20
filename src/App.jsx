import React, { useState } from 'react';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setToken(`jwt-token-demo-${username}`);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 400, margin: '50px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8, background: '#fff' }}>
      <h2 style={{ color: '#1e3a8a', textAlign: 'center' }}>EduTrack — Acceso Institucional</h2>
      <p style={{ color: '#666', fontSize: 13, textAlign: 'center' }}>Portal IAM (HU-003) | Puerto 3001</p>
      
      {!token ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 'bold' }}>Usuario / Correo</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="ej: jgonzalez" 
              required 
              style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 'bold' }}>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" style={{ padding: 10, background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>
            Iniciar Sesión
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#059669', fontWeight: 'bold' }}>¡Autenticado con éxito!</p>
          <p style={{ fontSize: 12, background: '#f3f4f6', padding: 8, wordBreak: 'break-all' }}>{token}</p>
          <button onClick={() => setToken(null)} style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
