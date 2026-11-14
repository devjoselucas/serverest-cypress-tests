import { apiRequest } from './client';

const PATH = '/carrinhos';

export const carrinhosApi = {
  criar: (produtos, token) => apiRequest({ method: 'POST', path: PATH, body: { produtos }, token }),
  buscarPorId: (id) => apiRequest({ path: `${PATH}/${id}` }),
  // Exclui o carrinho e devolve os produtos ao estoque.
  cancelarCompra: (token) =>
    apiRequest({ method: 'DELETE', path: `${PATH}/cancelar-compra`, token }),
  // Exclui o carrinho sem devolver os produtos ao estoque.
  concluirCompra: (token) =>
    apiRequest({ method: 'DELETE', path: `${PATH}/concluir-compra`, token }),
};
