import { Account } from './modules/account/account';
import { Blocks } from './modules/blocks/blocks';
import { Key } from './modules/key/key';
import { Node } from './modules/node/node';
import { NonaParams } from './modules/nona/nona-interface';
import { Wallet } from './modules/wallet/wallet';
import { NonaWebSocket } from './modules/websocket/websocket';
import { Rpc } from './services/rpc/rpc';
import { NanoAddress } from './shared/utils/address';

export class Nona {
  private remoteProcedureCall: Rpc;

  public ws: NonaWebSocket;
  public blocks: Blocks;
  public key: Key;
  public node: Node;

  constructor({
    /** URL of the node */
    url = 'http://localhost:7076',
    /** URL of the WebSocket */
    websocketUrl = 'ws://localhost:7078',
  }: NonaParams = {}) {
    this.remoteProcedureCall = new Rpc({ url });
    this.ws = new NonaWebSocket({ url: websocketUrl });
    this.blocks = new Blocks(this.remoteProcedureCall);
    this.node = new Node(this.remoteProcedureCall);
    this.key = new Key();
  }

  public account(address: NanoAddress): Account {
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
