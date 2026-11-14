/**
 * Registro de limpeza da massa de dados.
 *
 * Quem cria um dado registra aqui como desfazê-lo; o hook global em `e2e.js` executa
 * tudo ao final de cada teste, em ordem inversa à criação (ex.: cancela o carrinho,
 * depois exclui o produto, depois o usuário). Assim os testes não deixam resíduos no
 * ambiente e não precisam repetir blocos de `afterEach`.
 */
const pendentes = [];

export const registrarLimpeza = (desfazer) => {
  pendentes.push(desfazer);
};

export const executarLimpeza = () => {
  while (pendentes.length > 0) {
    pendentes.pop()();
  }
};
