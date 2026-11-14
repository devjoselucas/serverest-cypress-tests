# Plano de testes

Registro das decisões por trás da suíte: o que foi coberto, por quê, e o que ficou de fora.

## Objetivo e escopo

Validar os fluxos de maior valor do ServeRest (frontend e API) com uma suíte automatizada
estável, independente e barata de manter. O enunciado pede 3 cenários por camada; a suíte os
entrega e acrescenta um quarto cenário de frontend, os contratos da API e a evidência dos
defeitos encontrados.

## Como os cenários foram escolhidos

Cada candidato foi avaliado por dois critérios: o impacto no negócio se a funcionalidade
quebrar e a probabilidade de quebra (regras, integrações, perfis de acesso).

| Cenário                         | Por que entrou                                                              |
| ------------------------------- | --------------------------------------------------------------------------- |
| Login (frontend e API)          | Porta de entrada de todos os fluxos; define o perfil e o destino do usuário |
| Cadastro de usuário (frontend)  | Primeiro contato do cliente; integra formulário, API e redirecionamento     |
| Lista de compras (frontend)     | Principal jornada do cliente disponível na interface                        |
| Cadastro de produtos (frontend) | Principal jornada do administrador; conecta os dois perfis                  |
| Usuários (API)                  | Base de todos os demais recursos; regra de unicidade de e-mail              |
| Carrinhos (API)                 | Maior concentração de regra de negócio: totais e movimentação de estoque    |
| Contratos (API)                 | Protege quem consome a API contra mudanças de formato                       |

## Distribuição entre as camadas

- **Regras de negócio ficam na API**: são mais rápidas, mais estáveis e apontam a causa com
  precisão. Estoque, totais, autorização por perfil e validações são verificados ali.
- **O frontend cobre jornadas**: o que só existe na interface (navegação, mensagens,
  redirecionamentos, integração da tela com a API). Não repete pela interface as regras já
  verificadas na API.
- **Pré-condições sempre pela API**, mesmo nos testes de frontend. Só os testes de login passam
  pela tela de login.

## Tipos de teste e quando rodam

| Tipo                | Onde                         | Quando roda no pipeline               |
| ------------------- | ---------------------------- | ------------------------------------- |
| Smoke (`@smoke`)    | Um caminho feliz por cenário | Logo após o lint; bloqueia o restante |
| Regressão funcional | Todos os specs               | Após o smoke, em Chrome e Firefox     |
| Contrato            | `cypress/e2e/api/contratos`  | Junto com a regressão de API          |
| Defeitos conhecidos | `cypress/known-issues`       | Sob demanda; falham de propósito      |

## Técnicas aplicadas

- **Partição de equivalência**: para cada cenário, um representante válido e os inválidos
  relevantes (credencial incorreta, e-mail duplicado, campos ausentes).
- **Análise de valor limite**: estoque insuficiente é testado com exatamente uma unidade acima
  do disponível.
- **Transição de estado**: o estoque é verificado antes da reserva, depois dela e após o
  cancelamento do carrinho.
- **Teste por perfil**: as mesmas rotas e telas são exercitadas como cliente e como
  administrador.

## Massa de dados e ambiente

- Ambiente público e compartilhado com outras pessoas, sem controle sobre os dados existentes.
- Nenhum teste depende de dados pré-existentes. Tudo é criado via API, com identificadores
  únicos e um prefixo próprio da suíte, e removido ao final de cada teste.
- Para execuções interrompidas existe a varredura `npm run data:cleanup`.
- As URLs são configuráveis, o que permite apontar a mesma suíte para um ambiente local.

## Fora do escopo

| Item                                         | Motivo                                                          |
| -------------------------------------------- | --------------------------------------------------------------- |
| Carrinho pelo frontend                       | A tela está em construção na aplicação (defeito F2)             |
| Edição e exclusão pelo painel administrativo | Menor risco que o cadastro; a regra já é coberta na API         |
| Relatórios do administrador                  | Funcionalidade sem comportamento definido para validar          |
| Desempenho e carga                           | Ambiente público compartilhado: medições não seriam confiáveis  |
| Segurança aprofundada                        | Os achados encontrados estão documentados, sem teste de invasão |
| Acessibilidade e responsividade              | Exigem critérios próprios; ficam como evolução                  |

## Critérios de qualidade da suíte

- A suíte principal passa integralmente; nenhum teste é ignorado ou falha de propósito.
- Qualquer teste roda sozinho e em qualquer ordem.
- Nenhum resíduo de dados no ambiente após a execução.
- Nenhuma espera por tempo fixo.

## Próximos passos

1. Rodar a API em contêiner no pipeline, para não depender do ambiente público.
2. Verificações de acessibilidade nas telas principais.
3. Cobrir o carrinho pelo frontend quando a funcionalidade for concluída.
