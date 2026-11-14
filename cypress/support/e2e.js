import './commands/dados';
import './commands/ui';
import { executarLimpeza } from './cleanup';

// Remove a massa criada pelo teste, independentemente de ele ter passado ou falhado.
afterEach(() => {
  executarLimpeza();
});
