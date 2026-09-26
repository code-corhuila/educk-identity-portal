import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptSessionFromApi, buildMockLoginResponse, getLoginValidationError, getRolePresentation, inferMockRole } from './session.js';

test('validates malformed credentials with a friendly message', () => {
  assert.match(getLoginValidationError({ email: 'invalid', password: 'short' }), /Correo o contraseña/);
  assert.equal(getLoginValidationError({ email: 'docente@edutrack.edu.co', password: 'valid-pass' }), '');
});

test('infers the three supported mock roles', () => {
  assert.equal(inferMockRole('directivo@edutrack.edu.co'), 'DIRECTIVO');
  assert.equal(inferMockRole('docente@edutrack.edu.co'), 'DOCENTE');
  assert.equal(inferMockRole('familia@example.com'), 'ACUDIENTE');
});

test('maps each role to its profile presentation', () => {
  assert.equal(getRolePresentation('DIRECTIVO').label, 'Directivo');
  assert.equal(getRolePresentation('DOCENTE').label, 'Docente');
  assert.equal(getRolePresentation('ACUDIENTE').label, 'Acudiente');
});

test('rejects roles outside the institutional set', () => {
  assert.throws(() => getRolePresentation('ADMIN'), /Unsupported identity role/);
});

test('adapts the documented API response without mutating it', () => {
  const raw = buildMockLoginResponse('docente@edutrack.edu.co');
  const session = adaptSessionFromApi(raw);
  assert.equal(session.user.email, 'docente@edutrack.edu.co');
  assert.equal(session.user.role, 'DOCENTE');
  assert.notEqual(session.user, raw.user);
});

test('rejects an incomplete identity API response', () => {
  assert.throws(() => adaptSessionFromApi({ accessToken: '', user: null }), /Invalid identity API response/);
});
