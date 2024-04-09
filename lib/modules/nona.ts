import { Rpc } from '../services/rpc/rpc';
import { Wallet } from './wallet/wallet';
import { Account } from './account/account';
import { Blocks } from './blocks/blocks';
import { Key } from './key/key';
import { NonaWebSocket } from './websocket/websocket';

export class Nona {
  private rpc: Rpc;

  public webSocket: NonaWebSocket;
  public blocks: Blocks;
  public key: Key;

  // TODO: Set options in interface
  // TODO: Set default values in interface
  constructor(url = 'http://localhost:7076', webSocketUrl = 'ws://localhost:7078') {
    this.rpc = new Rpc({ url });
    this.webSocket = new NonaWebSocket({ url: webSocketUrl });
    this.blocks = new Blocks(this.rpc);
    this.key = new Key(this.rpc);
  }

  public account(account: string): Account {
    return new Account(account, this.webSocket, this.rpc);
  }

  public wallet(privateKey: string): Wallet {
    return new Wallet(privateKey, this.blocks, this.rpc, this.webSocket);
  }
}
