export const SUPPORTED_ROLES = ['DIRECTIVO', 'DOCENTE', 'ACUDIENTE'];

const BACKEND_ROLE_MAP = Object.freeze({
  PARENT: 'ACUDIENTE',
  TEACHER: 'DOCENTE',
  ADMIN: 'DIRECTIVO',
  SUPER_ADMIN: 'DIRECTIVO',
  ACUDIENTE: 'ACUDIENTE',
  DOCENTE: 'DOCENTE',
  DIRECTIVO: 'DIRECTIVO'
});

const ROLE_PRESENTATION = {
  DIRECTIVO: { label: 'Directivo', description: 'Gestión institucional' },
  DOCENTE: { label: 'Docente', description: 'Acompañamiento académico' },
  ACUDIENTE: { label: 'Acudiente', description: 'Seguimiento del estudiante' }
};

export function mapBackendRole(rawRole) {
  if (!rawRole || typeof rawRole !== 'string') return null;
  return BACKEND_ROLE_MAP[rawRole.trim().toUpperCase()] || null;
}

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
 * Adapts the authentication response from educk-identity-api or OpenAPI AuthResponse.
 * Maps backend roles (PARENT, TEACHER, ADMIN, SUPER_ADMIN) to UI roles and rejects unmapped roles.
 * The token stays in memory and is never written to URLs.
 */
export function adaptSessionFromApi(rawResponse) {
  if (!rawResponse || typeof rawResponse !== 'object') {
    throw new Error('Invalid identity API response');
  }
  const accessToken = rawResponse.accessToken || rawResponse.token;
  const rawUser = rawResponse.user || (rawResponse.email || rawResponse.userId || rawResponse.role
    ? {
        id: rawResponse.userId,
        email: rawResponse.email,
        name: rawResponse.fullName,
        role: rawResponse.role,
        schoolId: rawResponse.schoolId
      }
    : null);
  const mappedRole = mapBackendRole(rawUser?.role);
  if (!accessToken || !rawUser || !mappedRole) {
    throw new Error('Invalid identity API response');
  }
  const fullName = rawUser.name || rawUser.fullName || [rawUser.firstName, rawUser.lastName].filter(Boolean).join(' ') || rawUser.email;
  return {
    accessToken,
    tokenType: rawResponse.tokenType || 'Bearer',
    expiresIn: Number(rawResponse.expiresIn) || 900,
    user: {
      ...rawUser,
      role: mappedRole,
      ...(fullName && !rawUser.firstName ? { name: fullName } : {})
    }
  };
}

