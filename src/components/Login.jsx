import React, { useState } from 'react';
import { setSession, loginWithApi } from 'educk-front';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const gatewayUrl = import.meta.env.VITE_API_GATEWAY_URL;
      const redirectUrl = import.meta.env.VITE_REDIRECT_URL;
      
      if (!gatewayUrl || !redirectUrl) {
        throw new Error('System configuration error: Missing gateway or redirect URL');
      }

      const data = await loginWithApi(email, password, gatewayUrl);
      
      setSession(data.user, data.token);
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Authentication failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Left Half - Form */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', padding: '60px' }}>
        
        <div style={{ marginBottom: '60px' }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
            Edu<span style={{ color: '#00C4A7' }}>Track</span>
          </span>
        </div>

        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '14px', color: '#00C4A7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            PORTAL PARA FAMILIAS
          </h2>
          <h1 style={{ fontSize: '42px', color: '#0F172A', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1px' }}>
            Todo su progreso,<br/>en un solo lugar.
          </h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginBottom: '40px', lineHeight: 1.5 }}>
            Calificaciones, asistencia y comunicación escolar en tiempo casi real.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Correo electrónico</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria.lopez@email.com"
                required
                style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '16px', color: '#0F172A', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Contraseña</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '16px', color: '#0F172A', outline: 'none' }}
              />
            </div>

            {errorMessage && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                backgroundColor: '#FEF2F2', 
                color: '#991B1B', 
                fontSize: '14px',
                border: '1px solid #FECACA'
              }}>
                {errorMessage}
              </div>
            )}
            <button 
              type="submit" 
              style={{
                background: '#1E3A8A', 
                color: '#ffffff', 
                padding: '16px', 
                borderRadius: '8px', 
                fontWeight: 600, 
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                marginTop: '10px'
              }}>
              Ingresar a EduTrack
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a href="#" style={{ color: '#1E3A8A', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>¿Olvidaste tu contraseña?</a>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '60px', color: '#94A3B8', fontSize: '12px' }}>
            🔒 Conexión segura · Tus datos están protegidos
          </div>
        </div>
      </div>

      {/* Right Half - Branding (Hidden on mobile, visible on desktop) */}
      <div style={{ 
          flex: 1, 
          backgroundColor: '#1E3A8A', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
        
        {/* Gradient decoration */}
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00C4A7 0%, #29B6F6 100%)',
          boxShadow: '0 0 100px rgba(0,0,0,0.1)'
        }} />
        
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 40px' }}>
          <h2 style={{ color: '#ffffff', fontSize: '48px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-1px' }}>
            Acompaña su aprendizaje<br/>sin perderte nada.
          </h2>
        </div>

      </div>

    </div>
  );
}
