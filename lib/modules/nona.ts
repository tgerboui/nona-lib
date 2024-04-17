import { Rpc } from '../services/rpc/rpc';
import { Account } from './account/account';
import { Blocks } from './blocks/blocks';
import { Key } from './key/key';
import { Node } from './node/node';
import { Wallet } from './wallet/wallet';
import { NonaWebSocket } from './websocket/websocket';

export class Nona {
  private remoteProcedureCall: Rpc;

  public ws: NonaWebSocket;
  public blocks: Blocks;
  public key: Key;
  public node: Node;

  // TODO: Set options in interface
  // TODO: Set default values in interface
  constructor(url = 'http://localhost:7076', webSocketUrl = 'ws://localhost:7078') {
    this.remoteProcedureCall = new Rpc({ url });
    this.ws = new NonaWebSocket({ url: webSocketUrl });
    this.blocks = new Blocks(this.remoteProcedureCall);
    this.key = new Key(this.remoteProcedureCall);
    this.node = new Node(this.remoteProcedureCall);
  }

  public account(address: string): Account {
    return new Account(address, this.ws, this.remoteProcedureCall);
  }

  public wallet(privateKey: string): Wallet {
    return new Wallet(privateKey, this.blocks, this.remoteProcedureCall, this.ws);
  }

  /**
   * Makes an RPC call to the node.
   * @param action - The action to be performed.
   * @param body - The optional request body.
   * @returns A Promise that resolves to the response data.
   */
  public rpc(action: string, body?: object): Promise<unknown> {
    return this.remoteProcedureCall.call(action, body);
  }
}
