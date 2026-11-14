# ServeRest - Testes automatizados com Cypress

Automação de testes E2E (frontend) e de API da aplicação [ServeRest](https://serverest.dev),
desenvolvida em **Cypress + JavaScript**.

- Frontend: <https://front.serverest.dev>
- API (Swagger): <https://serverest.dev>

## Cenários cobertos

| Camada   | Cenário             | O que é validado                                                                                     | Spec                                          |
| -------- | ------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Frontend | Login               | Acesso de usuário comum (loja), de administrador (área admin) e recusa de credenciais inválidas      | `cypress/e2e/frontend/login.cy.js`            |
| Frontend | Cadastro de usuário | Cadastro pela tela com conferência na API, e-mail duplicado e campos obrigatórios                    | `cypress/e2e/frontend/cadastro-usuario.cy.js` |
| Frontend | Lista de compras    | Pesquisa e inclusão de produto, alteração de quantidade e limpeza da lista                           | `cypress/e2e/frontend/lista-de-compras.cy.js` |
| API      | Usuários            | Cadastro e consulta, e-mail duplicado e campos obrigatórios                                          | `cypress/e2e/api/usuarios.cy.js`              |
| API      | Login               | Emissão do token, credenciais inválidas, validação de campos e autorização por perfil (403)          | `cypress/e2e/api/login.cy.js`                 |
| API      | Carrinhos           | Totais e reserva de estoque, devolução ao cancelar, estoque insuficiente e exigência de autenticação | `cypress/e2e/api/carrinhos.cy.js`             |

Cada cenário reúne o caminho feliz e suas principais variações negativas: 20 testes no total.

## Pré-requisitos

- [Node.js](https://nodejs.org) 20 ou superior (o projeto fixa a versão 22 no `.nvmrc`)
- npm (instalado com o Node.js)
- Acesso à internet (os testes rodam contra o ambiente público do ServeRest)

## Instalação

```bash
git clone https://github.com/devjoselucas/serverest-cypress-tests.git
cd serverest-cypress-tests
npm ci
```

Se o binário do Cypress não for baixado automaticamente na instalação, execute `npx cypress install`.

## Execução

| Comando            | O que faz                             |
| ------------------ | ------------------------------------- |
| `npm test`         | Executa toda a suíte em modo headless |
| `npm run test:api` | Executa apenas os testes de API       |
| `npm run test:e2e` | Executa apenas os testes de frontend  |
| `npm run cy:open`  | Abre o Cypress em modo interativo     |
| `npm run lint`     | Analisa o código com ESLint           |
| `npm run format`   | Formata o código com Prettier         |

Para escolher o navegador: `npm test -- --browser chrome`.

### Apontando para outro ambiente

As URLs não ficam espalhadas pelo código. Para rodar contra outro ambiente (por exemplo, o
ServeRest local via `npx serverest`):

```bash
CYPRESS_BASE_URL=http://localhost:8080 API_URL=http://localhost:3000 npm test
```

## Estrutura do projeto

```
cypress/
├── e2e/
│   ├── api/                 # Specs de API
│   └── frontend/            # Specs E2E do frontend
├── pages/                   # Page Objects (seletores e ações de cada tela)
└── support/
    ├── api/                 # Camada de serviços: um módulo por recurso da API
    ├── commands/            # Comandos customizados (massa de dados e interface)
    ├── factories/           # Geração de dados dinâmicos com Faker
    ├── cleanup.js           # Registro de limpeza da massa de dados
    └── e2e.js               # Carrega os comandos e o hook global de limpeza
docs/
└── comportamentos-inesperados.md
.github/workflows/tests.yml  # Pipeline de CI
```

## Decisões de projeto

**Padrões aplicados**

- **Page Objects** (`cypress/pages`): concentram seletores e ações. Não contêm asserções; quem
  decide o que é esperado é o teste.
- **Camada de serviços de API** (`cypress/support/api`): os specs chamam `usuariosApi.criar(...)`
  em vez de montar requisições. URL base, header de autenticação e tratamento de status ficam em
  um único cliente (`client.js`).
- **Factories** (`cypress/support/factories`): cada teste gera a própria massa, com valores
  padrão válidos e a possibilidade de sobrescrever só o que importa para o cenário.
- **Comandos customizados** apenas para o que é transversal: preparação de massa
  (`cy.criarUsuario`, `cy.criarProduto`, `cy.obterToken`) e utilidades de interface
  (`cy.getByTestId`, `cy.loginViaApi`).

**Massa de dados e independência**

- O ambiente é público e compartilhado, então nenhum teste depende de dados pré-existentes nem
  de e-mails fixos: tudo é criado via API com identificadores únicos.
- Cada teste monta as próprias pré-condições e pode ser executado sozinho, em qualquer ordem.
- Todo dado criado é registrado para limpeza e removido ao final do teste por um hook global,
  em ordem inversa à criação (carrinho, depois produto, depois usuário), inclusive quando o
  teste falha.

**Estabilidade**

- Seletores por `data-testid`; quando a aplicação não oferece um, por papel (`role`) ou texto
  visível ao usuário. Nenhum seletor acoplado a classes de estilo ou à estrutura do HTML, com
  exceção do card de produto (`.card`), que não possui identificador próprio.
- Sem esperas fixas (`cy.wait(ms)`): a sincronização usa `cy.intercept` + alias nas chamadas
  que a tela dispara e as asserções com retentativa do Cypress.
- Pré-condições pela API, não pela interface: só os testes de login passam pela tela de login.
  Os demais autenticam com `cy.loginViaApi` (`cy.session`).
- Retentativas habilitadas apenas no modo headless (`retries.runMode`), para absorver oscilações
  do ambiente público sem mascarar falhas durante o desenvolvimento.

## Integração contínua

O workflow em `.github/workflows/tests.yml` roda a cada push e pull request:

1. **Lint e formatação**: falha rápido, sem baixar o binário do Cypress.
2. **Testes**: suítes de API e de frontend em paralelo (matriz), no Chrome, com cache de
   dependências e publicação dos screenshots como artefato quando há falha.

## Correspondência com Playwright

A solução foi organizada com práticas que não dependem do framework. Em uma suíte Playwright,
a mesma arquitetura seria mantida, trocando apenas o mecanismo:

| Nesta suíte (Cypress)                      | Equivalente em Playwright                                    |
| ------------------------------------------ | ------------------------------------------------------------ |
| Page Objects em `cypress/pages`            | Page Objects recebendo `page`, expostos por fixtures         |
| `cy.getByTestId`                           | `page.getByTestId` (nativo), além de `getByRole`/`getByText` |
| Camada de serviços sobre `cy.request`      | A mesma camada sobre `APIRequestContext` (`request`)         |
| `cy.loginViaApi` com `cy.session`          | Projeto de setup + `storageState`                            |
| Comandos de massa + hook global de limpeza | Fixtures com teardown após o `use()`                         |
| `cy.intercept` + `cy.wait('@alias')`       | `page.waitForResponse` / `page.route`                        |
| Asserções com retentativa (`should`)       | Asserções web-first (`expect(locator)`)                      |
| `retries.runMode` e screenshots em falha   | `retries`, `trace: 'on-first-retry'` e screenshots           |
| Matriz no GitHub Actions                   | `projects`, `--shard` e workers em paralelo                  |

## Comportamentos inesperados

Os desvios encontrados na aplicação durante o desenvolvimento estão descritos em
[docs/comportamentos-inesperados.md](docs/comportamentos-inesperados.md). Eles não afetam a
execução da suíte principal.
