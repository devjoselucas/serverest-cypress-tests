/**
 * Contratos (JSON Schema) das respostas da API ServeRest.
 * `additionalProperties: false` faz o teste acusar também campos novos ou renomeados.
 */
const id = { type: 'string', pattern: '^[a-zA-Z0-9]{16}$' };

const objeto = (title, properties) => ({
  title,
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const lista = (title, chave, item) =>
  objeto(title, {
    quantidade: { type: 'integer', minimum: 0 },
    [chave]: { type: 'array', items: item },
  });

export const mensagemSchema = objeto('mensagem', { message: { type: 'string', minLength: 1 } });

export const cadastroSchema = objeto('cadastro', {
  message: { type: 'string', minLength: 1 },
  _id: id,
});

export const loginSchema = objeto('login', {
  message: { type: 'string', minLength: 1 },
  authorization: { type: 'string', pattern: '^Bearer [\\w-]+\\.[\\w-]+\\.[\\w-]+$' },
});

export const usuarioSchema = objeto('usuário', {
  nome: { type: 'string', minLength: 1 },
  email: { type: 'string', pattern: '^[^@\\s]+@[^@\\s]+$' },
  password: { type: 'string', minLength: 1 },
  administrador: { enum: ['true', 'false'] },
  _id: id,
});

export const listaUsuariosSchema = lista('lista de usuários', 'usuarios', usuarioSchema);

export const produtoSchema = objeto('produto', {
  nome: { type: 'string', minLength: 1 },
  preco: { type: 'integer', minimum: 1 },
  descricao: { type: 'string', minLength: 1 },
  quantidade: { type: 'integer', minimum: 0 },
  _id: id,
});

export const listaProdutosSchema = lista('lista de produtos', 'produtos', produtoSchema);

export const carrinhoSchema = objeto('carrinho', {
  produtos: {
    type: 'array',
    minItems: 1,
    items: objeto('item do carrinho', {
      idProduto: id,
      quantidade: { type: 'integer', minimum: 1 },
      precoUnitario: { type: 'integer', minimum: 1 },
    }),
  },
  precoTotal: { type: 'integer', minimum: 1 },
  quantidadeTotal: { type: 'integer', minimum: 1 },
  idUsuario: id,
  _id: id,
});
