import { filter, map, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import WebSocket from 'ws';

import { WebsocketParams } from '../websocket-interface';
import {
  WebSocketManagerMessage,
  WebSocketManagerNext,
  WebsocketSubscriptionOptions,
  WebsocketTopic,
} from './websocket-manager-interface';

export class WebSocketManager {
  private wsSubject: WebSocketSubject<WebSocketManagerMessage>;

  constructor({ url }: WebsocketParams) {
    this.wsSubject = webSocket({
      url,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      WebSocketCtor: WebSocket as any,
    });
  }

  public multiplexSubscribe({ topic, options }: WebsocketSubscriptionOptions): Observable<unknown> {
    return this.wsSubject
      .multiplex(
        () => {
          return { action: 'subscribe', topic, options: options || {} };
        },
        () => {
          return { action: 'unsubscribe', topic, options: options || {} };
        },
        (message) => message.topic === topic,
      )
      .pipe<WebSocketManagerMessage['message']>(map((message) => message.message));
  }

  public subjectTopic(topic: WebsocketTopic): Observable<unknown> {
    return this.wsSubject.pipe(
      filter((message) => message.topic === topic),
      map((message) => message.message),
    );
  }

  public next({ action, topic, options }: WebSocketManagerNext): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    this.wsSubject.next({ action, topic, options } as any);
  }

  public subscribeTopic({ topic, options }: WebsocketSubscriptionOptions): void {
    this.next({
      action: 'subscribe',
      topic,
      options,
    });
  }

  public updateTopic({ topic, options }: WebsocketSubscriptionOptions): void {
    this.next({
      action: 'update',
      topic,
      options,
    });
  }

  public unsubscribeTopic(topic: WebsocketTopic): void {
    this.next({
      action: 'unsubscribe',
      topic,
    });
  }

  public complete(): void {
    this.wsSubject.complete();
  }
}
