import { Rpc } from '../services/rpc/rpc';
import { Account } from './account/account';
import { Accounts } from './accounts/accounts';
import { Blocks } from './blocks/blocks';
import { Key } from './key/key';
import { NonaWebSocket } from './websocket/websocket';

export class Nona {
  private rpc: Rpc;

  public webSocket: NonaWebSocket;
  public blocks: Blocks;
  public accounts: Accounts;
  public key: Key;

  // TODO: Set options in interface
  constructor(url = 'http://localhost:7076', webSocketUrl = 'ws://localhost:7078') {
    this.rpc = new Rpc({ url });
    this.webSocket = new NonaWebSocket({ url: webSocketUrl });
    this.blocks = new Blocks(this.rpc);
    this.key = new Key(this.rpc);
    this.accounts = new Accounts(this.rpc, this.webSocket);
  }

  account(privateKey: string): Account {
    return new Account({
      rpc: this.rpc,
      blocks: this.blocks,
      accounts: this.accounts,
      privateKey,
    });
  }
}
