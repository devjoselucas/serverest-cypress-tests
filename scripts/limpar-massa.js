#!/usr/bin/env node
/**
 * Varredura de resíduos da suíte no ambiente.
 *
 * Em execução normal cada teste remove a própria massa. Este script cobre o caso em que
 * a execução é interrompida no meio (Ctrl+C, queda do runner): remove usuários, carrinhos
 * e produtos identificados pelos prefixos de shared/massa.json.
 *
 * Não execute enquanto outra execução da suíte estiver em andamento no mesmo ambiente.
 *
 * Uso: npm run data:cleanup
 */
const massa = require('../shared/massa.json');

const API_URL = process.env.API_URL || 'https://serverest.dev';

const chamar = async (method, path, { token, body } = {}) => {
  const resposta = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: resposta.status, body: await resposta.json() };
};

const login = async ({ email, password }) =>
  (await chamar('POST', '/login', { body: { email, password } })).body.authorization;

const main = async () => {
  const { body: listaUsuarios } = await chamar('GET', '/usuarios');
  const usuarios = listaUsuarios.usuarios.filter(({ email }) =>
    email.startsWith(massa.prefixoEmail),
  );

  const { body: listaProdutos } = await chamar('GET', '/produtos');
  const produtos = listaProdutos.produtos.filter(({ nome }) =>
    nome.startsWith(massa.prefixoProduto),
  );

  // Carrinhos primeiro: usuário com carrinho e produto em carrinho não podem ser excluídos.
  for (const usuario of usuarios) {
    await chamar('DELETE', '/carrinhos/cancelar-compra', { token: await login(usuario) });
  }

  if (produtos.length > 0) {
    const admin = {
      nome: 'Varredura de massa',
      email: `${massa.prefixoEmail}varredura.${Date.now()}${massa.dominioEmail}`,
      password: 'varredura',
      administrador: 'true',
    };
    const { body: criado } = await chamar('POST', '/usuarios', { body: admin });
    const token = await login(admin);
    for (const produto of produtos) {
      await chamar('DELETE', `/produtos/${produto._id}`, { token });
    }
    await chamar('DELETE', `/usuarios/${criado._id}`);
  }

  for (const usuario of usuarios) {
    await chamar('DELETE', `/usuarios/${usuario._id}`);
  }

  console.log(`Removidos: ${usuarios.length} usuário(s) e ${produtos.length} produto(s).`);
};

main().catch((erro) => {
  console.error('Falha na varredura de massa:', erro.message);
  process.exit(1);
});
