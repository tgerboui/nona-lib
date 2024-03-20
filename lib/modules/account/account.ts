import { KeyService } from '../../services/hash/key-service';
import { Accounts } from '../accounts/accounts';
import { Receivable, ReceivableOptions } from '../accounts/accounts-interface';
import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { AccountOptions } from './account-interface';

export class Account extends RpcConsummer {
  private accounts: Accounts;

  privateKey: string;
  publicKey: string;
  account: string;

  constructor({ rpc, accounts, privateKey }: AccountOptions) {
    super(rpc);
    this.accounts = accounts;
    this.privateKey = privateKey;
    this.publicKey = KeyService.getPublicKey(privateKey);
    this.account = KeyService.getAccount(this.publicKey);
  }

  public receivable(options: Omit<ReceivableOptions, 'account'>): Promise<Receivable> {
    const { sort } = options;
    // TODO: Clean this horror show
    // It is a probleme with fucntion overloading
    if (sort == undefined) {
      return this.accounts.receivable({ ...options, account: this.account, sort: undefined });
    }
    if (sort === true) {
      return this.accounts.receivable({ ...options, account: this.account, sort: true });
    }
    return this.accounts.receivable({ ...options, account: this.account, sort: false });
  }
}
