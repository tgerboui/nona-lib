import { Subscription } from 'rxjs';

import { WebSocketConfirmation } from '../../../../lib/modules/websocket/confirmation/websocket-confirmation';
import { WebSocketManager } from '../../../../lib/modules/websocket/manager/websocket-manager';
import { NonaWebSocket } from '../../../../lib/modules/websocket/websocket';

jest.mock('../../../../lib/modules/websocket/confirmation/websocket-confirmation');
jest.mock('../../../../lib/modules/websocket/manager/websocket-manager');

describe('NonaWebSocket class', () => {
  let nonaWebSocket: NonaWebSocket;
  let webSocketManagerMock: jest.Mocked<WebSocketManager>;
  let webSocketConfirmationMock: jest.Mocked<WebSocketConfirmation>;

  beforeEach(() => {
    webSocketManagerMock = new WebSocketManager({
      url: 'http://example.com',
    }) as jest.Mocked<WebSocketManager>;
    webSocketConfirmationMock = new WebSocketConfirmation(
      webSocketManagerMock,
    ) as jest.Mocked<WebSocketConfirmation>;
    nonaWebSocket = new NonaWebSocket({ url: 'wss://example.com' });
    nonaWebSocket['webSocketConfirmation'] = webSocketConfirmationMock;
    nonaWebSocket['webSocketManager'] = webSocketManagerMock;
  });

  describe('constructor', () => {
    it('should initialize WebSocketManager and WebSocketConfirmation with provided URL', () => {
      expect(nonaWebSocket).toBeDefined();
      expect(WebSocketManager).toHaveBeenCalledWith({ url: 'wss://example.com' });
      expect(WebSocketConfirmation).toHaveBeenCalledWith(webSocketManagerMock);
    });
  });

  describe('confirmation', () => {
    it('should delegate to WebSocketConfirmation.subscribe', () => {
      const params = { next: jest.fn(), error: jest.fn(), complete: jest.fn() };
      const subscription = new Subscription();
      webSocketConfirmationMock.subscribe.mockReturnValue(subscription);

      const result = nonaWebSocket.confirmation(params);
      expect(webSocketConfirmationMock.subscribe).toHaveBeenCalledWith(params);
      expect(result).toBe(subscription);
    });
  });
});
