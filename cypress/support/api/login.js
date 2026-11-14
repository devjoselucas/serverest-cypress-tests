import { apiRequest } from './client';

export const loginApi = {
  autenticar: (credenciais) => apiRequest({ method: 'POST', path: '/login', body: credenciais }),
};
