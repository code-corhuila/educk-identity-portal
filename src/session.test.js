import { test, expect } from 'vitest';
import { adaptSessionFromApi, buildMockLoginResponse, getLoginValidationError, getRolePresentation, inferMockRole } from './session.js';

test('validates malformed credentials with a friendly message', () => {
  expect(getLoginValidationError({ email: 'invalid', password: 'short' })).toMatch(/Correo o contraseña/);
  expect(getLoginValidationError({ email: 'docente@edutrack.edu.co', password: 'valid-pass' })).toBe('');
});

test('infers the three supported mock roles', () => {
  expect(inferMockRole('directivo@edutrack.edu.co')).toBe('DIRECTIVO');
  expect(inferMockRole('docente@edutrack.edu.co')).toBe('DOCENTE');
  expect(inferMockRole('familia@example.com')).toBe('ACUDIENTE');
});

test('maps each role to its profile presentation', () => {
  expect(getRolePresentation('DIRECTIVO').label).toBe('Directivo');
  expect(getRolePresentation('DOCENTE').label).toBe('Docente');
  expect(getRolePresentation('ACUDIENTE').label).toBe('Acudiente');
});

test('rejects roles outside the institutional set', () => {
  expect(() => getRolePresentation('ADMIN')).toThrow(/Unsupported identity role/);
});

test('adapts the documented API response without mutating it', () => {
  const raw = buildMockLoginResponse('docente@edutrack.edu.co');
  const session = adaptSessionFromApi(raw);
  expect(session.user.email).toBe('docente@edutrack.edu.co');
  expect(session.user.role).toBe('DOCENTE');
  expect(session.user).not.toBe(raw.user);
});

test('rejects an incomplete identity API response', () => {
  expect(() => adaptSessionFromApi({ accessToken: '', user: null })).toThrow(/Invalid identity API response/);
});
