# ServeRest - Testes automatizados com Cypress

[![Testes automatizados](https://github.com/devjoselucas/serverest-cypress-tests/actions/workflows/tests.yml/badge.svg)](https://github.com/devjoselucas/serverest-cypress-tests/actions/workflows/tests.yml)

Automação de testes E2E (frontend) e de API da aplicação [ServeRest](https://serverest.dev),
desenvolvida em **Cypress + JavaScript**, com uma suíte espelho em **Playwright**.

- Frontend: <https://front.serverest.dev>
- API (Swagger): <https://serverest.dev>
- Relatórios da última execução: <https://devjoselucas.github.io/serverest-cypress-tests/>

## Cenários cobertos

| Camada   | Cenário             | O que é validado                                                                                     | Spec                                          |
| -------- | ------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Frontend | Login               | Acesso de usuário comum (loja), de administrador (área admin) e recusa de credenciais inválidas      | `cypress/e2e/frontend/login.cy.js`            |
| Frontend | Cadastro de usuário | Cadastro pela tela com conferência na API, e-mail duplicado e campos obrigatórios                    | `cypress/e2e/frontend/cadastro-usuario.cy.js` |
| Frontend | Lista de compras    | Pesquisa e inclusão de produto, alteração de quantidade e limpeza da lista                           | `cypress/e2e/frontend/lista-de-compras.cy.js` |
| API      | Usuários            | Cadastro e consulta, e-mail duplicado e campos obrigatórios                                          | `cypress/e2e/api/usuarios.cy.js`              |
| API      | Login               | Emissão do token, credenciais inválidas, validação de campos e autorização por perfil (403)          | `cypress/e2e/api/login.cy.js`                 |
| API      | Carrinhos           | Totais e reserva de estoque, devolução ao cancelar, estoque insuficiente e exigência de autenticação | `cypress/e2e/api/carrinhos.cy.js`             |

Esses são os 3 cenários por camada pedidos no enunciado. Cada um reúne o caminho feliz e suas
principais variações negativas.

### Além do escopo pedido

| Entrega                     | O que é                                                                                        | Onde                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Cenário de administrador    | Cadastro de produto pela tela, conferido na loja com um segundo perfil                         | `cypress/e2e/frontend/produtos-admin.cy.js` |
| Testes de contrato          | Validação do formato das respostas da API com JSON Schema                                      | `cypress/e2e/api/contratos.cy.js`           |
| Defeitos como testes        | Cada defeito documentado vira um teste que falha enquanto o defeito existir, em suíte separada | `cypress/known-issues`                      |
| Suíte espelho em Playwright | Os mesmos 7 cenários com fixtures, `storageState` e execução paralela                          | `playwright/`                               |
| Execução por tags           | `@smoke` (um caminho feliz por cenário) e `@contract`                                          | scripts `test:smoke`, `test:contract`       |
| Relatórios publicados       | Relatórios HTML do Cypress e do Playwright no GitHub Pages a cada execução na branch principal | link no topo                                |

A suíte principal do Cypress tem 27 testes; a do Playwright, 23 (35 execuções com Firefox).

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

Se o binário do Cypress não for baixado automaticamente na instalação, execute
`npx cypress install`. Os navegadores do Playwright só são necessários para a suíte espelho:
`npm run pw:install`.

## Execução

### Cypress

| Comando                     | O que faz                                                       |
| --------------------------- | --------------------------------------------------------------- |
| `npm test`                  | Executa toda a suíte em modo headless                           |
| `npm run test:api`          | Executa apenas os testes de API                                 |
| `npm run test:e2e`          | Executa apenas os testes de frontend                            |
| `npm run test:smoke`        | Executa apenas os testes `@smoke`                               |
| `npm run test:contract`     | Executa apenas os testes de contrato                            |
| `npm run test:known-issues` | Executa os defeitos conhecidos (falha de propósito, ver abaixo) |
| `npm run cy:open`           | Abre o Cypress em modo interativo                               |

Para escolher o navegador: `npm test -- --browser chrome`. Ao final de cada execução o
relatório HTML fica em `reports/cypress/index.html`.

### Playwright

| Comando                 | O que faz                                        |
| ----------------------- | ------------------------------------------------ |
| `npm run pw:install`    | Baixa o Chromium e o Firefox do Playwright       |
| `npm run pw:test`       | Executa API, Chromium e Firefox em paralelo      |
| `npm run pw:test:api`   | Executa apenas os testes de API                  |
| `npm run pw:test:e2e`   | Executa apenas os testes de frontend no Chromium |
| `npm run pw:test:smoke` | Executa apenas os testes `@smoke`                |
| `npm run pw:report`     | Abre o relatório HTML da última execução         |

### Manutenção

| Comando                | O que faz                                                |
| ---------------------- | -------------------------------------------------------- |
| `npm run lint`         | Analisa o código com ESLint                              |
| `npm run format`       | Formata o código com Prettier                            |
| `npm run data:cleanup` | Remove do ambiente resíduos de uma execução interrompida |

### Apontando para outro ambiente

As URLs não ficam espalhadas pelo código. Para rodar contra outro ambiente (por exemplo, o
ServeRest local via `npx serverest`):

```bash
CYPRESS_BASE_URL=http://localhost:8080 API_URL=http://localhost:3000 npm test
```

No Playwright as variáveis são `BASE_URL` e `API_URL`.

## Estrutura do projeto

```
cypress/
├── e2e/
│   ├── api/                 # Specs de API (funcionais e de contrato)
│   └── frontend/            # Specs E2E do frontend
├── known-issues/            # Defeitos conhecidos como testes (fora da suíte principal)
├── pages/                   # Page Objects e componentes compartilhados
└── support/
    ├── api/                 # Camada de serviços: um módulo por recurso da API
    ├── commands/            # Comandos customizados (massa de dados e interface)
    ├── cleanup.js           # Registro de limpeza da massa de dados
    ├── contrato.js          # Validação de JSON Schema
    └── e2e.js               # Carrega os comandos e o hook global de limpeza
playwright/
├── pages/                   # Page Objects (recebem `page`)
├── support/                 # Fixtures e camada de serviços da API
└── tests/                   # Specs de API e E2E
shared/                      # Independente de framework, usado pelas duas suítes
├── factories/               # Geração de dados dinâmicos com Faker
├── schemas/                 # Contratos (JSON Schema) da API
└── massa.json               # Prefixos que identificam a massa da suíte
scripts/limpar-massa.js      # Varredura de resíduos no ambiente
docs/                        # Plano de testes e comportamentos inesperados
.github/workflows/tests.yml  # Pipeline de CI
```

## Decisões de projeto

**Padrões aplicados**

- **Page Objects** (`cypress/pages`): concentram seletores e ações. Não contêm asserções; quem
  decide o que é esperado é o teste. O que se repete entre telas vira componente (`Alertas`).
- **Camada de serviços de API** (`cypress/support/api`): os specs chamam `usuariosApi.criar(...)`
  em vez de montar requisições. URL base, header de autenticação e tratamento de status ficam em
  um único cliente (`client.js`).
- **Factories** (`shared/factories`): cada teste gera a própria massa, com valores padrão
  válidos e a possibilidade de sobrescrever só o que importa para o cenário.
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
- A massa carrega um prefixo próprio da suíte. Se uma execução for interrompida no meio,
  `npm run data:cleanup` remove o que ficou.

**Estabilidade**

- Seletores por `data-testid`; quando a aplicação não oferece um, por papel (`role`) ou texto
  visível ao usuário. As exceções são o card de produto (`.card`) e a linha da tabela de
  produtos (`tr`), que não possuem identificador próprio.
- Sem esperas fixas (`cy.wait(ms)`): a sincronização usa `cy.intercept` + alias nas chamadas
  que a tela dispara e as asserções com retentativa do Cypress.
- Pré-condições pela API, não pela interface: só os testes de login passam pela tela de login.
  Os demais autenticam com `cy.loginViaApi` (`cy.session`).
- Retentativas habilitadas apenas no modo headless (`retries.runMode`), para absorver oscilações
  do ambiente público sem mascarar falhas durante o desenvolvimento.

As decisões de cobertura (por que estes cenários, o que ficou de fora) estão no
[plano de testes](docs/plano-de-testes.md).

## Integração contínua

O workflow em `.github/workflows/tests.yml` roda a cada push e pull request, e também por
agendamento em dias úteis, para detectar mudanças no ambiente público mesmo sem commits:

1. **Lint e formatação**: falha rápido, sem baixar navegadores.
2. **Smoke**: um caminho feliz por cenário. Se falhar, a regressão nem começa.
3. **Regressão**, em paralelo: Cypress (API no Chrome; frontend no Chrome e no Firefox) e
   Playwright (API, Chromium e Firefox).
4. **Relatórios**: os relatórios HTML de todos os jobs são publicados no GitHub Pages, inclusive
   quando há falha.

## Cypress e Playwright lado a lado

A pasta `playwright/` implementa os mesmos cenários com a mesma arquitetura, trocando apenas o
mecanismo. As factories e os prefixos de massa em `shared/` são usados pelas duas suítes.

| Nesta suíte (Cypress)                      | Na suíte espelho (Playwright)                                |
| ------------------------------------------ | ------------------------------------------------------------ |
| Page Objects em `cypress/pages`            | Page Objects que recebem `page` (`playwright/pages`)         |
| `cy.getByTestId`                           | `page.getByTestId`, `getByRole` e `getByText` nativos        |
| Camada de serviços sobre `cy.request`      | A mesma camada sobre `APIRequestContext`                     |
| `cy.loginViaApi` com `cy.session`          | Fixture `abrirSessao`, que injeta o token via `storageState` |
| Comandos de massa + hook global de limpeza | Fixture `massa`, que desfaz o que criou depois do `use()`    |
| `beforeEach` + aliases                     | Fixtures locais por arquivo (`test.extend`)                  |
| `cy.intercept` + `cy.wait('@alias')`       | `page.waitForResponse`                                       |
| Asserções com retentativa (`should`)       | Asserções web-first (`expect(locator)`)                      |
| Troca de perfil com um novo `cy.session`   | Dois contextos de navegador isolados no mesmo teste          |
| `retries.runMode` e screenshots em falha   | `retries`, `trace: 'on-first-retry'` e screenshots           |
| Tags com `@cypress/grep`                   | Tags nativas (`{ tag: '@smoke' }` e `--grep`)                |
| Specs em série, matriz no GitHub Actions   | `fullyParallel` e projetos por camada e navegador            |

## Comportamentos inesperados

Os desvios encontrados na aplicação durante o desenvolvimento estão descritos em
[docs/comportamentos-inesperados.md](docs/comportamentos-inesperados.md). Eles não afetam a
execução da suíte principal.

A maior parte deles também existe como teste em `cypress/known-issues`. Esses testes descrevem
o comportamento esperado e, por isso, **falham de propósito** enquanto o defeito existir:
`npm run test:known-issues` termina com erro, e isso é o resultado previsto. A suíte fica fora
do `npm test` e do pipeline.
