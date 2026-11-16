# Manutenção da suíte

Guia para quem mantém a suíte depois da entrega: o que fazer quando o pipeline falha sem que o
código tenha mudado e como tratar os defeitos conhecidos ao longo do tempo.

## Por que a suíte pode falhar sem mudança no código

Os testes rodam contra o ambiente público do ServeRest, que é compartilhado e pode ser
atualizado a qualquer momento, sem aviso. Por isso o pipeline também roda por agendamento em
dias úteis: uma mudança na aplicação aparece no dia seguinte, e não só no próximo commit.

Enquanto a causa não for tratada, o selo de CI do README fica vermelho.

## Quando a execução agendada falhar

1. **Identifique o teste** que falhou no job do pipeline ou nos
   [relatórios publicados](https://devjoselucas.github.io/serverest-cypress-tests/).
2. **Reproduza localmente**, rodando só o spec afetado:

   ```bash
   npx cypress run --browser chrome --spec cypress/e2e/frontend/produtos-admin.cy.js
   ```

3. **Classifique a falha**:

   | O que se observa                                                 | Causa provável                    | O que fazer                                                 |
   | ---------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------- |
   | Passa ao repetir, sem alteração                                  | Instabilidade do ambiente público | Reexecutar o pipeline; se virar rotina, investigar a espera |
   | Falha sempre, e a própria aplicação mostra erro ou resposta nova | Mudança ou defeito da aplicação   | Tratar como defeito conhecido (seção abaixo)                |
   | Falha sempre, mas a aplicação funciona ao ser usada manualmente  | Teste desatualizado               | Corrigir o teste (seletor, mensagem ou pré-condição)        |

Para distinguir os dois últimos casos, o caminho mais curto é repetir a operação direto na API
e comparar com o que a tela envia. O screenshot da falha, salvo em `cypress/screenshots`,
mostra a requisição e a mensagem exibida pela aplicação.

## Movendo um teste para os defeitos conhecidos

Quando a falha é da aplicação, a suíte principal não deve ficar vermelha nem perder a evidência:

1. Registre o defeito em [comportamentos-inesperados.md](comportamentos-inesperados.md), com
   um identificador, os passos para reproduzir e a data em que foi detectado.
2. Mova o teste afetado para `cypress/known-issues`, com o identificador no título. Ele passa a
   descrever o comportamento esperado e a falhar de propósito.
3. Mantenha na suíte principal o que continua funcionando no mesmo cenário, usando a API para
   as pré-condições que a tela deixou de permitir.
4. Aplique o mesmo ajuste na suíte Playwright, para as duas continuarem equivalentes.
5. Atualize as contagens de testes no README.

## Quando um defeito conhecido for corrigido

A correção não quebra nada: o teste correspondente em `cypress/known-issues` simplesmente passa
a ficar verde.

```bash
npm run test:known-issues
```

Para cada teste que passar:

1. Devolva o teste à suíte principal (`cypress/e2e`) e à suíte Playwright.
2. Remova o item de [comportamentos-inesperados.md](comportamentos-inesperados.md).
3. Atualize as contagens de testes no README.

Como essa suíte fica fora do pipeline, vale executá-la sempre que a execução agendada acusar
uma mudança no ambiente e antes de qualquer nova entrega.

## Registro de ocorrências

| Data       | O que aconteceu                                                                                                             | Como foi detectado                             | Ação                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 16/11/2026 | A API passou a recusar preço e quantidade enviados como texto, e o cadastro de produto pela tela deixou de funcionar (F10). | Execução agendada do pipeline, no job de smoke | Fluxo movido para os defeitos conhecidos; a suíte principal passou a criar o produto pela API (`b9ad849`) |
