import { test, expect } from 'vitest';
import { adaptSessionFromApi, getLoginValidationError, getRolePresentation } from './session.js';

test('validates malformed credentials with a friendly message', () => {
  expect(getLoginValidationError({ email: 'invalid', password: 'short' })).toMatch(/Correo o contraseña/);
  expect(getLoginValidationError({ email: 'docente@edutrack.edu.co', password: 'valid-pass' })).toBe('');
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
  const raw = {
    accessToken: 'mocked-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      id: '001',
      email: 'docente@edutrack.edu.co',
      role: 'DOCENTE',
      firstName: 'María',
      lastName: 'González',
      status: 'ACTIVE'
    }
  };
  const session = adaptSessionFromApi(raw);
  expect(session.user.email).toBe('docente@edutrack.edu.co');
  expect(session.user.role).toBe('DOCENTE');
  expect(session.user).not.toBe(raw.user);
});

test('adapts the identity API flat response and maps backend roles', () => {
  const raw = {
    token: 'rs256.jwt.token',
    tokenType: 'Bearer',
    expiresIn: 900,
    userId: '11111111-1111-1111-1111-111111111111',
    email: 'maria.lopez@edutrack.edu.co',
    fullName: 'María López',
    role: 'PARENT',
    schoolId: '00000000-0000-4000-8000-000000000001'
  };
  const session = adaptSessionFromApi(raw);
  expect(session.accessToken).toBe('rs256.jwt.token');
  expect(session.user.role).toBe('ACUDIENTE');
  expect(session.user.name).toBe('María López');
  expect(session.expiresIn).toBe(900);
});

test('rejects unmapped roles such as STUDENT or empty responses', () => {
  expect(() => adaptSessionFromApi({ token: 't', role: 'STUDENT' })).toThrow(/Invalid identity API response/);
  expect(() => adaptSessionFromApi({ accessToken: '', user: null })).toThrow(/Invalid identity API response/);
});
