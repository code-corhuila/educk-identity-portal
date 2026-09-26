// Mock local de educk-front para tests unitarios del portal.
// En runtime, el Shell (educk-front) inyecta estas funciones.

export const setSession = () => {};
export const getSession = () => null;
export const clearSession = () => {};
export const loginWithApi = async () => {
  throw new Error('loginWithApi debe ser mockeado en tests');
};
