/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import WebSocket from 'ws';

import { WebSocketManager } from '../../../../../lib/modules/websocket/manager/websocket-manager';

jest.mock('rxjs/webSocket', () => ({
  webSocket: jest.fn().mockImplementation(() => ({
    multiplex: jest.fn(),
    pipe: jest.fn(),
    next: jest.fn(),
    complete: jest.fn(),
    subscribe: jest.fn(),
  })),
}));
jest.mock('ws');

describe('WebSocketManager class', () => {
  let webSocketManager: WebSocketManager;
  let mockWebSocketSubject: jest.Mocked<WebSocketSubject<any>>;

  beforeEach(() => {
    mockWebSocketSubject = webSocket({
      url: 'wss://example.com',
      WebSocketCtor: WebSocket as any,
    }) as jest.Mocked<WebSocketSubject<any>>;

    webSocketManager = new WebSocketManager({ url: 'wss://example.com' });
    webSocketManager['wsSubject'] = mockWebSocketSubject;
  });

  describe('constructor', () => {
    it('should initialize WebSocketSubject with provided URL and WebSocket constructor', () => {
      expect(webSocketManager).toBeDefined();
      expect((webSocket as any).mock.calls[0][0]).toEqual({
        url: 'wss://example.com',
        WebSocketCtor: WebSocket,
      });
    });
  });

  describe('multiplexSubscribe', () => {
    it('should return an observable that multiplexes the messages based on topic and options', () => {
      const options = { someOption: 'value' };
      const topic = 'confirmation';
      mockWebSocketSubject.multiplex.mockReturnValue(new Observable());

      const observable = webSocketManager.multiplexSubscribe({ topic, options });
      expect(mockWebSocketSubject.multiplex).toHaveBeenCalled();
      expect(observable).toBeInstanceOf(Observable);
    });

    it('should pass the correct parameters to multiplex', () => {
      const options = { someOption: 'value' };
      const topic = 'confirmation';
      mockWebSocketSubject.multiplex.mockReturnValue(new Observable());

      webSocketManager.multiplexSubscribe({ topic, options });
      expect(mockWebSocketSubject.multiplex).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
      );
      const multiplexCall = mockWebSocketSubject.multiplex.mock.calls[0];
      expect(multiplexCall[0]()).toEqual({ action: 'subscribe', topic, options });
      expect(multiplexCall[1]()).toEqual({ action: 'unsubscribe', topic, options });
      expect(multiplexCall[2]({ topic })).toBe(true);
    });

    it('should pass the correct parameters to multiplex if no options', () => {
      const topic = 'confirmation';
      mockWebSocketSubject.multiplex.mockReturnValue(new Observable());

      webSocketManager.multiplexSubscribe({ topic });
      expect(mockWebSocketSubject.multiplex).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
      );
      const multiplexCall = mockWebSocketSubject.multiplex.mock.calls[0];
      expect(multiplexCall[0]()).toEqual({ action: 'subscribe', topic, options: {} });
      expect(multiplexCall[1]()).toEqual({ action: 'unsubscribe', topic, options: {} });
      expect(multiplexCall[2]({ topic })).toBe(true);
    });

    it('should correctly pipe the observable', (done) => {
      const topic = 'confirmation';
      const mockMessage = { topic, message: 'Hello World' };

      // Simulate multiplex returning a simple observable that emits the mock message
      mockWebSocketSubject.multiplex.mockReturnValue(
        new Observable((subscriber) => {
          subscriber.next(mockMessage);
        }),
      );

      const observable = webSocketManager.multiplexSubscribe({ topic });

      // Subscribe to the observable and verify the output
      observable.subscribe({
        next: (message) => {
          expect(message).toEqual('Hello World');
          done();
        },
      });
    });
  });

  describe('subjectTopic', () => {
    it('should return an observable filtered by topic', () => {
      const topic = 'confirmation';
      jest.spyOn(mockWebSocketSubject, 'pipe').mockImplementation(() => new Observable());

      const result = webSocketManager.subjectTopic(topic);
      expect(result).toBeInstanceOf(Observable);
    });

    it('should correctly pipe the observable', (done) => {
      const topic = 'confirmation';
      const nonTargetTopic = 'other-topic';
      const messages = [
        { topic: topic, message: 'Hello from target' },
        { topic: nonTargetTopic, message: 'Hello from elsewhere' },
        { topic: topic, message: 'Another message from target' },
      ];

      webSocketManager['wsSubject'] = new Observable((subscriber) => {
        messages.forEach((message) => subscriber.next(message));
        subscriber.complete();
      }) as any;

      const observable = webSocketManager.subjectTopic(topic);

      // Collect the results from the observable to verify filtering and mapping
      const results: any[] = [];
      observable.subscribe({
        next: (message) => results.push(message),
        complete: () => {
          expect(results.length).toBe(2);
          expect(results).toContain('Hello from target');
          expect(results).toContain('Another message from target');
          done();
        },
      });
    });
  });

  describe('next', () => {
    it('should send data to the webSocket subject', () => {
      const action = 'subscribe';
      const topic = 'topic';
      const options = { test: 'test' };

      jest.spyOn(mockWebSocketSubject, 'next');

      webSocketManager.next({ action, topic, options });
      expect(mockWebSocketSubject.next).toHaveBeenCalledWith({
        action,
        topic,
        options,
      });
    });
  });

  describe('subscribeTopic', () => {
    it('should invoke next with subscribe action and provided topic and options', () => {
      const topic = 'confirmation';
      const options = { key: 'value' };

      jest.spyOn(webSocketManager, 'next');

      webSocketManager.subscribeTopic({ topic, options });
      expect(webSocketManager.next).toHaveBeenCalledWith({
        action: 'subscribe',
        topic,
        options,
      });
    });
  });

  describe('updateTopic', () => {
    it('should invoke next with update action and provided topic and options', () => {
      const topic = 'confirmation';
      const options = { key: 'value' };

      jest.spyOn(webSocketManager, 'next');

      webSocketManager.updateTopic({ topic, options });
      expect(webSocketManager.next).toHaveBeenCalledWith({
        action: 'update',
        topic,
        options,
      });
    });
  });

  describe('unsubscribeTopic', () => {
    it('should invoke next with unsubscribe action and provided topic', () => {
      const topic = 'confirmation';

      jest.spyOn(webSocketManager, 'next');

      webSocketManager.unsubscribeTopic(topic);
      expect(webSocketManager.next).toHaveBeenCalledWith({
        action: 'unsubscribe',
        topic,
      });
    });
  });

  describe('complete', () => {
    it('should complete the WebSocketSubject', () => {
      jest.spyOn(mockWebSocketSubject, 'complete');

      webSocketManager.complete();
      expect(mockWebSocketSubject.complete).toHaveBeenCalled();
    });
  });
});
