import { test as base, expect } from '@playwright/test';
import { novoAdministrador, novoProduto, novoUsuario } from '../../shared/factories';
import { criarServicos } from './api';

/**
 * Fixtures da suíte. Substituem os comandos customizados e o hook global de limpeza do
 * Cypress: cada fixture entrega o recurso ao teste e desfaz o que criou depois do `use()`.
 */
export const test = base.extend({
  // Opção configurável em playwright.config.js (use.apiURL).
  apiURL: ['https://serverest.dev', { option: true }],

  // Serviços da API, em um contexto HTTP próprio apontando para a URL da API.
  api: async ({ playwright, apiURL }, use) => {
    const request = await playwright.request.newContext({ baseURL: apiURL });
    await use(criarServicos(request));
    await request.dispose();
  },

  // Preparação de massa via API. Tudo o que é criado aqui é removido ao final do teste,
  // em ordem inversa à criação (carrinho, depois produto, depois usuário).
  massa: async ({ api }, use) => {
    const limpezas = [];
    const limparAoFinal = (desfazer) => limpezas.push(desfazer);

    const criarUsuario = async (overrides = {}) => {
      const usuario = novoUsuario(overrides);
      const resposta = await api.usuarios.criar(usuario);
      expect(resposta.status(), 'pré-condição: usuário criado via API').toBe(201);
      const { _id } = await resposta.json();
      limparAoFinal(() => api.usuarios.excluir(_id));
      return { ...usuario, _id };
    };

    const obterToken = async ({ email, password }) => {
      const resposta = await api.login.autenticar({ email, password });
      expect(resposta.status(), 'pré-condição: login via API').toBe(200);
      return (await resposta.json()).authorization;
    };

    const criarProduto = async (overrides = {}) => {
      const produto = novoProduto(overrides);
      // Cadastrar produto exige um administrador; ele é criado apenas para esta preparação.
      const tokenAdmin = await obterToken(await criarUsuario(novoAdministrador()));
      const resposta = await api.produtos.criar(produto, tokenAdmin);
      expect(resposta.status(), 'pré-condição: produto criado via API').toBe(201);
      const { _id } = await resposta.json();
      limparAoFinal(() => api.produtos.excluir(_id, tokenAdmin));
      return { ...produto, _id };
    };

    const criarCarrinho = async (produtos, token) => {
      const resposta = await api.carrinhos.criar(produtos, token);
      if (resposta.status() === 201) {
        limparAoFinal(() => api.carrinhos.cancelarCompra(token));
      }
      return resposta;
    };

    await use({ limparAoFinal, criarUsuario, obterToken, criarProduto, criarCarrinho });

    for (const desfazer of limpezas.reverse()) {
      await desfazer();
    }
  },

  // Abre uma página já autenticada como o usuário informado, sem passar pela tela de login:
  // o token obtido pela API é injetado via storageState. Cada chamada usa um contexto de
  // navegador isolado, o que permite ter mais de um perfil no mesmo teste.
  abrirSessao: async ({ browser, baseURL, massa }, use) => {
    const contextos = [];

    await use(async (usuario) => {
      const token = await massa.obterToken(usuario);
      const contexto = await browser.newContext({
        baseURL,
        storageState: {
          cookies: [],
          origins: [
            {
              origin: baseURL,
              localStorage: [
                { name: 'serverest/userEmail', value: usuario.email },
                { name: 'serverest/userToken', value: token },
              ],
            },
          ],
        },
      });
      contextos.push(contexto);
      return contexto.newPage();
    });

    await Promise.all(contextos.map((contexto) => contexto.close()));
  },
});

export { expect };
