import { carrinhosApi, loginApi, produtosApi, usuariosApi } from '../api';
import { registrarLimpeza } from '../cleanup';
import { novoAdministrador, novoProduto, novoUsuario } from '../factories';

// Comandos de preparação de massa via API. Todo dado criado aqui é removido
// automaticamente ao final do teste (ver support/cleanup.js).

// Para dados criados pelo próprio teste (ex.: cadastro feito pela tela). Os specs devem
// usar este comando em vez de importar support/cleanup.js: spec e support file são
// empacotados separadamente e não compartilhariam o mesmo registro.
Cypress.Commands.add('limparAoFinal', (desfazer) => {
  registrarLimpeza(desfazer);
});

Cypress.Commands.add('criarUsuario', (overrides = {}) => {
  const usuario = novoUsuario(overrides);

  return usuariosApi.criar(usuario).then(({ status, body }) => {
    expect(status, 'pré-condição: usuário criado via API').to.eq(201);
    registrarLimpeza(() => usuariosApi.excluir(body._id));
    return { ...usuario, _id: body._id };
  });
});

Cypress.Commands.add('obterToken', ({ email, password }) =>
  loginApi.autenticar({ email, password }).then(({ status, body }) => {
    expect(status, 'pré-condição: login via API').to.eq(200);
    return body.authorization;
  }),
);

Cypress.Commands.add('criarProduto', (overrides = {}) => {
  const produto = novoProduto(overrides);

  // Cadastrar produto exige um administrador; ele é criado apenas para esta preparação.
  return cy
    .criarUsuario(novoAdministrador())
    .then((admin) => cy.obterToken(admin))
    .then((tokenAdmin) =>
      produtosApi.criar(produto, tokenAdmin).then(({ status, body }) => {
        expect(status, 'pré-condição: produto criado via API').to.eq(201);
        registrarLimpeza(() => produtosApi.excluir(body._id, tokenAdmin));
        return { ...produto, _id: body._id };
      }),
    );
});

Cypress.Commands.add('criarCarrinho', (produtos, token) =>
  carrinhosApi.criar(produtos, token).then((resposta) => {
    if (resposta.status === 201) {
      registrarLimpeza(() => carrinhosApi.cancelarCompra(token));
    }
    return resposta;
  }),
);
