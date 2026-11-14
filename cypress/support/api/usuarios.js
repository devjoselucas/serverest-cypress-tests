import { apiRequest } from './client';

const PATH = '/usuarios';

export const usuariosApi = {
  criar: (usuario) => apiRequest({ method: 'POST', path: PATH, body: usuario }),
  listar: (filtros) => apiRequest({ path: PATH, qs: filtros }),
  buscarPorId: (id) => apiRequest({ path: `${PATH}/${id}` }),
  atualizar: (id, usuario) => apiRequest({ method: 'PUT', path: `${PATH}/${id}`, body: usuario }),
  excluir: (id) => apiRequest({ method: 'DELETE', path: `${PATH}/${id}` }),
};
