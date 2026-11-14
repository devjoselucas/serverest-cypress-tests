# Comportamentos inesperados encontrados

Registro do que foi observado na aplicação durante a automação. Nenhum destes pontos faz a
suíte falhar: os testes cobrem o comportamento atual e estável, e os desvios ficam documentados
aqui para avaliação do time.

> O ServeRest é uma aplicação didática e parte destes comportamentos pode ser intencional.
> Ainda assim, em um produto real cada item abaixo seria aberto como defeito ou débito.

Ambiente: `https://front.serverest.dev` e `https://serverest.dev`, verificados em 14/11/2026 (o item F7 inclui também o `data-testid="cadastarProdutos"`, com erro de digitação).

## API

| #   | Comportamento                                                                | Como reproduzir                                                                       | Esperado                                                        | Severidade |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------- |
| A1  | A listagem de usuários expõe a senha em texto puro e não exige autenticação. | `GET /usuarios` sem header `Authorization`.                                           | Senha nunca retornada; rota protegida.                          | Alta       |
| A2  | O token JWT carrega a senha do usuário no payload.                           | `POST /login` e decodificar a parte central do token (Base64): há o campo `password`. | Payload apenas com identificadores não sensíveis.               | Alta       |
| A3  | Qualquer pessoa exclui qualquer usuário, sem autenticação.                   | `DELETE /usuarios/{_id}` sem header `Authorization` retorna `200`.                    | `401` sem token; exclusão restrita ao próprio usuário ou admin. | Alta       |

## Frontend

| #   | Comportamento                                                                                                | Como reproduzir                                                            | Esperado                                                    | Severidade |
| --- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------- |
| F1  | Após o cadastro, a senha fica gravada em texto puro no `localStorage` (`serverest/userPassword`).            | Cadastrar-se em `/cadastrarusuarios` e inspecionar o `localStorage`.       | Senha nunca persistida no navegador.                        | Alta       |
| F2  | O botão "Adicionar no carrinho" leva a uma página com o texto "Em construção aguarde".                       | Adicionar um produto à lista e clicar em "Adicionar no carrinho".          | Fluxo de carrinho funcional ou botão indisponível.          | Média      |
| F3  | Na lista de compras, o campo "Preço" passa a exibir o subtotal (preço × quantidade) sem indicar isso.        | Adicionar um produto e clicar em "+": o valor de "Preço" dobra.            | Preço unitário e subtotal identificados separadamente.      | Baixa      |
| F4  | Com a lista de compras vazia, a mensagem é "Seu carrinho está vazio".                                        | Em `/minhaListaDeProdutos`, clicar em "Limpar Lista".                      | Mensagem coerente com a tela ("Sua lista está vazia").      | Baixa      |
| F5  | O alerta de sucesso do cadastro não tem `role="alert"` (os de erro têm) e o texto é um link para `/#`.       | Concluir um cadastro e inspecionar o alerta.                               | Mesmo padrão acessível dos alertas de erro, sem link morto. | Baixa      |
| F6  | O documento declara `lang="en"`, mas todo o conteúdo está em português.                                      | Inspecionar a tag `<html>`.                                                | `lang="pt-BR"` (afeta leitores de tela e tradução).         | Baixa      |
| F7  | Marcação inconsistente para testes: `data-testid="adicionar carrinho"` (com espaço) e links `<a>` aninhados. | Inspecionar os cards da home e a lista de compras.                         | `data-testid` padronizado e HTML válido.                    | Baixa      |
| F8  | Um usuário comum autenticado consegue abrir as telas de administrador; só a API barra a operação (403).      | Entrar como usuário comum e acessar `/admin/cadastrarprodutos` pela URL.   | Redirecionamento para a loja ou tela de acesso negado.      | Média      |
| F9  | No cadastro de produto, a imagem aparece como obrigatória (`*`), mas o cadastro é aceito sem ela.            | Em `/admin/cadastrarprodutos`, cadastrar um produto sem selecionar imagem. | Indicação de obrigatoriedade coerente com a validação.      | Baixa      |

## Evidência executável

Os itens abaixo também existem como testes, em `cypress/known-issues`. Cada teste descreve o
comportamento **esperado** e, portanto, falha enquanto o defeito existir: quando um deles passar
a ficar verde, o defeito foi corrigido e o item pode sair deste documento.

```bash
npm run test:known-issues
```

Essa suíte fica fora da execução principal (`npm test`) e do pipeline, justamente por falhar de
propósito. Itens cobertos: A1, A2, A3, F1, F2, F3, F4, F5, F6 e F8. F7 e F9 são apenas
documentais.

## Impacto na automação

- **A3** foi usado a favor da suíte: a limpeza dos usuários criados não precisa de token.
- **F5** é o motivo de a mensagem de sucesso do cadastro ser localizada pelo texto, e não por
  `role="alert"` como os alertas de erro.
- A aplicação espera cerca de 3 segundos antes de redirecionar após o cadastro. O teste aguarda
  a mudança de rota com um timeout explícito, em vez de uma espera fixa.
