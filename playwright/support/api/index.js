/**
 * Camada de serviços da API sobre o APIRequestContext do Playwright.
 * Mesmo desenho da camada usada no Cypress (cypress/support/api): um serviço por recurso,
 * e os testes nunca montam requisições diretamente.
 */
const autorizacao = (token) => (token ? { Authorization: token } : {});

export const criarServicos = (request) => ({
  usuarios: {
    criar: (usuario) => request.post('/usuarios', { data: usuario }),
    listar: (filtros) => request.get('/usuarios', { params: filtros }),
    buscarPorId: (id) => request.get(`/usuarios/${id}`),
    excluir: (id) => request.delete(`/usuarios/${id}`),
  },
  login: {
    autenticar: (credenciais) => request.post('/login', { data: credenciais }),
  },
  produtos: {
    criar: (produto, token) =>
      request.post('/produtos', { data: produto, headers: autorizacao(token) }),
    listar: (filtros) => request.get('/produtos', { params: filtros }),
    buscarPorId: (id) => request.get(`/produtos/${id}`),
    excluir: (id, token) => request.delete(`/produtos/${id}`, { headers: autorizacao(token) }),
  },
  carrinhos: {
    criar: (produtos, token) =>
      request.post('/carrinhos', { data: { produtos }, headers: autorizacao(token) }),
    buscarPorId: (id) => request.get(`/carrinhos/${id}`),
    // Exclui o carrinho e devolve os produtos ao estoque.
    cancelarCompra: (token) =>
      request.delete('/carrinhos/cancelar-compra', { headers: autorizacao(token) }),
  },
});
