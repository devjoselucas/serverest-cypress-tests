import { apiRequest } from './client';

const PATH = '/produtos';

export const produtosApi = {
  criar: (produto, token) => apiRequest({ method: 'POST', path: PATH, body: produto, token }),
  listar: (filtros) => apiRequest({ path: PATH, qs: filtros }),
  buscarPorId: (id) => apiRequest({ path: `${PATH}/${id}` }),
  excluir: (id, token) => apiRequest({ method: 'DELETE', path: `${PATH}/${id}`, token }),
};
