import { Rpc } from '../../services/rpc/rpc';
import { Accounts } from '../accounts/accounts';

export interface AccountOptions {
  rpc: Rpc;
  accounts: Accounts;
  privateKey: string;
}
