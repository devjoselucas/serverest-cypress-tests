import {
  cadastroSchema,
  carrinhoSchema,
  listaProdutosSchema,
  listaUsuariosSchema,
  loginSchema,
  mensagemSchema,
  produtoSchema,
  usuarioSchema,
} from '../../../shared/schemas';
import { novoUsuario } from '../../../shared/factories';
import { carrinhosApi, loginApi, produtosApi, usuariosApi } from '../../support/api';
import { validarContrato } from '../../support/contrato';

// Os testes funcionais validam valores; estes validam o formato das respostas, para
// acusar quebras de contrato (campo removido, renomeado, com outro tipo ou inesperado).
describe('API - Contratos', { tags: '@contract' }, () => {
  it('usuários: cadastro, consulta por id e listagem', () => {
    const usuario = novoUsuario();

    usuariosApi.criar(usuario).then(({ body }) => {
      cy.limparAoFinal(() => usuariosApi.excluir(body._id));
      validarContrato(cadastroSchema, body);

      usuariosApi.buscarPorId(body._id).then((consulta) => {
        validarContrato(usuarioSchema, consulta.body);
      });
    });

    // Filtra pela própria massa para não depender dos dados de terceiros no ambiente.
    usuariosApi.listar({ email: usuario.email }).then(({ body }) => {
      validarContrato(listaUsuariosSchema, body);
    });
  });

  it('login: sucesso e erro de autenticação', () => {
    cy.criarUsuario().then(({ email, password }) => {
      loginApi.autenticar({ email, password }).then(({ body }) => {
        validarContrato(loginSchema, body);
      });

      loginApi.autenticar({ email, password: 'senha-incorreta' }).then(({ body }) => {
        validarContrato(mensagemSchema, body);
      });
    });
  });

  it('produtos: consulta por id e listagem', () => {
    cy.criarProduto().then((produto) => {
      produtosApi.buscarPorId(produto._id).then(({ body }) => {
        validarContrato(produtoSchema, body);
      });

      produtosApi.listar({ nome: produto.nome }).then(({ body }) => {
        validarContrato(listaProdutosSchema, body);
      });
    });
  });

  it('carrinhos: cadastro e consulta por id', () => {
    cy.criarProduto().then((produto) => {
      cy.criarUsuario()
        .then((usuario) => cy.obterToken(usuario))
        .then((token) => cy.criarCarrinho([{ idProduto: produto._id, quantidade: 2 }], token))
        .then(({ body }) => {
          validarContrato(cadastroSchema, body);

          carrinhosApi.buscarPorId(body._id).then((consulta) => {
            validarContrato(carrinhoSchema, consulta.body);
          });
        });
    });
  });
});
