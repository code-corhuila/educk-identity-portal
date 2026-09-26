import React, { useState } from 'react';
import { adaptSessionFromApi, buildMockLoginResponse, getLoginValidationError, getRolePresentation } from './session.js';
import './styles.css';

const INITIAL_FORM = { email: '', password: '' };

function LoginForm({ onLogin }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const updateField = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
    setError('');
  };
  const submit = (event) => {
    event.preventDefault();
    const validationError = getLoginValidationError(form);
    if (validationError) return setError(validationError);
    onLogin(adaptSessionFromApi(buildMockLoginResponse(form.email)));
  };

  return (
    <section className="auth-card" aria-labelledby="login-title">
      <div className="brand-mark" aria-hidden="true">ET</div>
      <p className="eyebrow">Portal de identidad</p>
      <h1 id="login-title">Acceso institucional</h1>
      <p className="intro">Ingresa con tu correo para consultar tu sesión de EduTrack.</p>
      <form onSubmit={submit} noValidate>
        <label htmlFor="email">Correo institucional</label>
        <input id="email" name="email" type="email" autoComplete="username" value={form.email}
          onChange={updateField} aria-describedby="login-help" required />
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password"
          value={form.password} onChange={updateField} required />
        <p id="login-help" className="help">Demo local: el rol se infiere del prefijo directivo o docente; los demás correos usan Acudiente.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" type="submit">Iniciar sesión</button>
      </form>
    </section>
  );
}

function ProfileCard({ session, onLogout }) {
  const { user } = session;
  const role = getRolePresentation(user.role);
  return (
    <section className="profile-card" aria-labelledby="profile-title">
      <header>
        <div className="avatar" aria-hidden="true">{user.firstName[0]}{user.lastName[0]}</div>
        <div>
          <p className="eyebrow">Sesión activa</p>
          <h1 id="profile-title">{user.firstName} {user.lastName}</h1>
          <span className={`role-badge role-${user.role.toLowerCase()}`}>{role.label}</span>
        </div>
      </header>
      <dl>
        <div><dt>Correo</dt><dd>{user.email}</dd></div>
        <div><dt>Rol institucional</dt><dd>{role.description}</dd></div>
        <div><dt>Estado</dt><dd><span className="status-dot" />{user.status === 'ACTIVE' ? 'Activo' : user.status}</dd></div>
      </dl>
      <p className="privacy-note">La credencial de acceso permanece únicamente en memoria y nunca se muestra en pantalla.</p>
      <button className="logout" type="button" onClick={onLogout}>Cerrar sesión</button>
    </section>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  return (
    <main className="identity-page">
      <aside className="identity-summary" aria-label="Información de EduTrack">
        <p className="eyebrow">EduTrack</p>
        <h2>Tu comunidad educativa, en un solo lugar.</h2>
        <p>Acceso seguro y una experiencia adaptada a tu rol institucional.</p>
      </aside>
      {session ? <ProfileCard session={session} onLogout={() => setSession(null)} /> : <LoginForm onLogin={setSession} />}
    </main>
  );
}
