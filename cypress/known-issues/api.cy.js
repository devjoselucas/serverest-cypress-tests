import { loginApi, usuariosApi } from '../support/api';

// Cada teste descreve o comportamento esperado de um item de
// docs/comportamentos-inesperados.md e falha enquanto o defeito existir.
describe('Defeitos conhecidos - API', () => {
  it('[A1] a listagem de usuários não deveria expor a senha', () => {
    cy.criarUsuario().then(({ email }) => {
      usuariosApi.listar({ email }).then(({ body }) => {
        expect(body.usuarios[0]).to.not.have.property('password');
      });
    });
  });

  it('[A2] o token JWT não deveria carregar a senha no payload', () => {
    cy.criarUsuario().then(({ email, password }) => {
      loginApi.autenticar({ email, password }).then(({ body }) => {
        const [, payload] = body.authorization.split('.');

        expect(JSON.parse(atob(payload))).to.not.have.property('password');
      });
    });
  });

  it('[A3] a exclusão de usuário deveria exigir autenticação', () => {
    cy.criarUsuario().then(({ _id }) => {
      usuariosApi.excluir(_id).its('status').should('eq', 401);
    });
  });
});
