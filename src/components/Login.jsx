import React, { useState } from 'react';
import { setSession, loginWithApi } from 'educk-front';
import { getLoginValidationError, adaptSessionFromApi } from '../session';
import '../App.css';

const ROLE_CONTEXTS = {
  family: { tag: 'PORTAL PARA FAMILIAS Y ACUDIENTES', title: 'Todo su progreso, en un solo lugar.', subtitle: 'Consulta boletines oficiales, asistencia diaria certificada y mensajería directa con el cuerpo docente.', sampleEmail: 'maria.lopez@email.com', sampleName: 'María López', roleCode: 'ACUDIENTE' },
  teacher: { tag: 'PORTAL DOCENTE Y ACADÉMICO', title: 'Gestión pedagógica ágil y trazable.', subtitle: 'Registra calificaciones, consolida asistencia por curso y comunícate con acudientes en tiempo real.', sampleEmail: 'carlos.ramirez@edutrack.edu.co', sampleName: 'Prof. Carlos Ramírez', roleCode: 'DOCENTE' },
  admin: { tag: 'DIRECCIÓN Y COORDINACIÓN', title: 'Supervisión institucional 360°.', subtitle: 'Monitorea indicadores de convivencia, auditoría de sesiones y trazabilidad distribuida por sede.', sampleEmail: 'rectoria@edutrack.edu.co', sampleName: 'Coordinación Institucional', roleCode: 'DIRECTIVO' }
};

function buildSessionRedirectUrl(redirectUrl, token, user, expiresIn = 3600, tokenType = 'Bearer') {
  const encoded = encodeURIComponent(JSON.stringify({ token, user, expiresIn, tokenType }));
  return `${redirectUrl}#edutrack_session=${encoded}`;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeRole, setActiveRole] = useState('family');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const roleInfo = ROLE_CONTEXTS[activeRole];

  const handleDemoSession = () => {
    const redirectUrl = import.meta.env.VITE_REDIRECT_URL || 'http://localhost:3000';
    const demoUser = { name: roleInfo.sampleName, email: email || roleInfo.sampleEmail, role: roleInfo.roleCode };
    const demoToken = `edutrack_demo_${activeRole}_2026`;
    setSession(demoToken, demoUser, 3600, 'Bearer');
    window.location.href = buildSessionRedirectUrl(redirectUrl, demoToken, demoUser, 3600, 'Bearer');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setErrorMessage('');
    
    const validationError = getLoginValidationError({ email, password });
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const gatewayUrl = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:8080';
      const redirectUrl = import.meta.env.VITE_REDIRECT_URL ?? 'http://localhost:3000';
      
      if (!gatewayUrl || !redirectUrl) {
        throw new Error('System configuration error: Missing gateway or redirect URL');
      }

      // Delegate the actual HTTP call to the shared educk-front client
      const rawData = await loginWithApi(email, password, gatewayUrl);
      
      // Adapt the data (throws if invalid)
      const sessionData = adaptSessionFromApi(rawData);
      
      // Store all session metadata, including expiresIn and tokenType
      setSession(sessionData.accessToken, sessionData.user, sessionData.expiresIn, sessionData.tokenType);
      
      window.location.href = buildSessionRedirectUrl(redirectUrl, sessionData.accessToken, sessionData.user, sessionData.expiresIn, sessionData.tokenType);
    } catch (error) {
      console.error('Login failed:', error);
      // Use the structured error message from the backend if available
      const serverMessage = error.body?.message || error.message || 'Authentication failed. Please check your credentials and try again.';
      setErrorMessage(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="et-login-shell">
      <section className="et-login-panel" aria-label="Formulario de autenticación institucional">
        <header className="et-brand-bar">
          <div className="et-brand-identity">
            <div className="et-brand-crest" aria-hidden="true">ET</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>
                Edu<span style={{ color: '#0D9488' }}>Track</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Colegio Institucional · Sedes Integradas</div>
            </div>
          </div>
          <span className="et-brand-badge">VIGENCIA 2026-B</span>
        </header>

        <div style={{ maxWidth: '420px', width: '100%', margin: '28px auto' }}>
          <div className="et-role-tabs" role="tablist" aria-label="Perfil de acceso">
            <button type="button" role="tab" aria-selected={activeRole === 'family'} className={`et-role-tab ${activeRole === 'family' ? 'active' : ''}`} onClick={() => setActiveRole('family')}>Familias</button>
            <button type="button" role="tab" aria-selected={activeRole === 'teacher'} className={`et-role-tab ${activeRole === 'teacher' ? 'active' : ''}`} onClick={() => setActiveRole('teacher')}>Docentes</button>
            <button type="button" role="tab" aria-selected={activeRole === 'admin'} className={`et-role-tab ${activeRole === 'admin' ? 'active' : ''}`} onClick={() => setActiveRole('admin')}>Directivos</button>
          </div>

          <h2 style={{ fontSize: '11px', color: '#0D9488', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>{roleInfo.tag}</h2>
          <h1 style={{ fontSize: '32px', color: '#0F172A', fontWeight: 800, lineHeight: 1.15, margin: '0 0 12px', letterSpacing: '-0.03em' }}>{roleInfo.title}</h1>
          <p style={{ color: '#475569', fontSize: '14px', margin: '0 0 26px', lineHeight: 1.55 }}>{roleInfo.subtitle}</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="email" style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>Correo electrónico institucional</label>
              <input id="email" name="email" type="email" autoComplete="username" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria.lopez@email.com" required className="et-field-input" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="current-password" style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>Contraseña</label>
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} style={{ background: 'none', border: 'none', color: '#1D4ED8', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input id="current-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" enterKeyHint="done" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" required className="et-field-input" />
            </div>

            {errorMessage && (
              <div role="alert" style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#991B1B', fontSize: '13px', fontWeight: 600, border: '1px solid #FECACA', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span>{errorMessage}</span>
                <button type="button" onClick={handleDemoSession} style={{ alignSelf: 'flex-start', background: '#991B1B', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                  Continuar en modo demostración ({roleInfo.roleCode}) →
                </button>
              </div>
            )}
            <button type="submit" disabled={isSubmitting} className="et-submit-btn">Ingresar a EduTrack</button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', fontSize: '12px', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => { setEmail(roleInfo.sampleEmail); setPassword('EduTrack2026*'); }} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '999px', padding: '5px 11px', color: '#334155', fontWeight: 600, fontSize: '11px', cursor: 'pointer' }}>
              Autocompletar ({activeRole === 'family' ? 'Acudiente' : activeRole === 'teacher' ? 'Docente' : 'Directivo'})
            </button>
            <button type="button" onClick={handleDemoSession} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '999px', padding: '5px 11px', color: '#1D4ED8', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
              Acceso Demo Directo →
            </button>
          </div>
        </div>

        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '11px', fontWeight: 600 }}>
          <span>Conexión cifrada TLS 1.3 · RBAC JWT · Trazabilidad W3C</span>
          <span>SSO Institucional</span>
        </footer>
      </section>

      <aside className="et-hero-showcase" aria-label="Resumen del ecosistema EduTrack">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ background: 'rgba(13, 148, 136, 0.22)', border: '1px solid rgba(45, 212, 191, 0.4)', color: '#5EEAD4', padding: '6px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em' }}>● PLATAFORMA INSTITUCIONAL EN LÍNEA</span>
          <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 600 }}>Arquitectura Micro-Frontend Federada</span>
        </div>

        <div style={{ maxWidth: '560px', margin: 'auto 0' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '40px', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 16px' }}>Acompaña su aprendizaje sin perderte nada.</h2>
          <p style={{ color: '#CBD5E1', fontSize: '16px', lineHeight: 1.6, margin: '0 0 32px' }}>Ecosistema educativo unificado que conecta a familias, docentes y coordinación académica con trazabilidad en tiempo real.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="et-feature-card">
              <span className="et-brand-badge" style={{ background: 'rgba(56,189,248,0.16)', color: '#7DD3FC', borderColor: 'rgba(56,189,248,0.3)' }}>NOTAS</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#F8FAFC', marginBottom: '4px' }}>Seguimiento Académico y Boletines Oficiales</div>
                <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.45 }}>Consulta notas parciales, promedios acumulados y retroalimentación docente por periodo.</div>
              </div>
            </div>
            <div className="et-feature-card">
              <span className="et-brand-badge" style={{ background: 'rgba(45,212,191,0.16)', color: '#5EEAD4', borderColor: 'rgba(45,212,191,0.3)' }}>DIARIO</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#F8FAFC', marginBottom: '4px' }}>Control de Asistencia Certificado</div>
                <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.45 }}>Registro diario con alertas tempranas de inasistencia o retardo y soporte de excusas médicas.</div>
              </div>
            </div>
            <div className="et-feature-card">
              <span className="et-brand-badge" style={{ background: 'rgba(129,140,248,0.18)', color: '#C7D2FE', borderColor: 'rgba(129,140,248,0.35)' }}>CANAL</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#F8FAFC', marginBottom: '4px' }}>Comunicación Oficial Escuela – Familia</div>
                <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.45 }}>Mensajería directa con profesores titulares, circulares institucionales y bandeja resiliente.</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '18px', fontSize: '12px', color: '#94A3B8' }}>
          <span>Corporación Universitaria del Huila · CORHUILA</span>
          <span>Seguridad Auditada · 2026</span>
        </div>
      </aside>
    </div>
  );
}
