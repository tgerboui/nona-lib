import { Rpc } from '../../services/rpc/rpc';
import { Accounts } from '../accounts/accounts';
import { Blocks } from '../blocks/blocks';

export interface AccountOptions {
  rpc: Rpc;
  accounts: Accounts;
  privateKey: string;
  blocks: Blocks;
}
