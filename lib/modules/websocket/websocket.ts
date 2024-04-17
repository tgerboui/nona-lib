import { Subscription } from 'rxjs';

import { WebSocketConfirmation } from './confirmation/websocket-confirmation';
import { WebSocketConfirmationParams } from './confirmation/websocket-confirmation-interface';
import { WebSocketManager } from './manager/websocket-manager';
import { WebsocketParams } from './websocket-interface';

export class NonaWebSocket {
  private webSocketManager: WebSocketManager;
  private webSocketConfirmation: WebSocketConfirmation;

  constructor({ url }: WebsocketParams) {
    this.webSocketManager = new WebSocketManager({ url });
    this.webSocketConfirmation = new WebSocketConfirmation(this.webSocketManager);
  }

  /**
   * Listens for confirmed blocks.
   *
   * @returns [Subscription](https://rxjs.dev/guide/subscription) object.
   */
  public confirmation(params: WebSocketConfirmationParams): Subscription {
    return this.webSocketConfirmation.subscribe(params);
  }
}
