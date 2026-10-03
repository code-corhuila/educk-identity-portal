export const SUPPORTED_ROLES = ['DIRECTIVO', 'DOCENTE', 'ACUDIENTE'];

const ROLE_PRESENTATION = {
  DIRECTIVO: { label: 'Directivo', description: 'Gestión institucional' },
  DOCENTE: { label: 'Docente', description: 'Acompañamiento académico' },
  ACUDIENTE: { label: 'Acudiente', description: 'Seguimiento del estudiante' }
};

export function getLoginValidationError({ email = '', password = '' }) {
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return 'Correo o contraseña incorrectos. Verifica los datos e intenta nuevamente.';
  }
  return '';
}



export function getRolePresentation(role) {
  if (!SUPPORTED_ROLES.includes(role)) throw new Error(`Unsupported identity role: ${role}`);
  return ROLE_PRESENTATION[role];
}

/**
 * Adapts the AuthTokenResponse documented by identity-service.yaml.
 * The API must provide accessToken, tokenType, expiresIn and a user with id, email,
 * role, firstName, lastName and status. The token stays in memory and is never rendered.
 */
export function adaptSessionFromApi(rawResponse) {
  const { accessToken, tokenType, expiresIn, user } = rawResponse;
  if (!accessToken || !user || !SUPPORTED_ROLES.includes(user.role)) {
    throw new Error('Invalid identity API response');
  }
  return { accessToken, tokenType, expiresIn, user: { ...user } };
}

