import { WebsocketParams } from './websocket-interface';
import { WebSocketManager } from './manager/websocket-manager';
import { WebSocketConfirmation } from './confirmation/websocket-confirmation';

export class NonaWebSocket {
  private webSocketManager: WebSocketManager;

  public confirmation: WebSocketConfirmation;

  constructor({ url }: WebsocketParams) {
    this.webSocketManager = new WebSocketManager({ url });
    this.confirmation = new WebSocketConfirmation(this.webSocketManager);
  }
}
