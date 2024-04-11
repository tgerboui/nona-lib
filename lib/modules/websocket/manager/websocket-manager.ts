/* eslint-disable @typescript-eslint/no-explicit-any */
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { map, filter, Observable } from 'rxjs';
import WebSocket from 'ws';

import {
  WebSocketManagerMessage,
  WebSocketManagerNext,
  WebsocketSubscriptionOptions,
  WebsocketTopic,
} from './websocket-manager-interface';
import { WebsocketParams } from '../websocket-interface';

export class WebSocketManager {
  private wsSubject: WebSocketSubject<WebSocketManagerMessage>;

  constructor({ url }: WebsocketParams) {
    this.wsSubject = webSocket({
      url,
      WebSocketCtor: WebSocket as any,
    });
  }

  public multiplexSubscribe({ topic, options }: WebsocketSubscriptionOptions) {
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

  public next({ action, topic, options }: WebSocketManagerNext) {
    this.wsSubject.next({ action, topic, options } as any);
  }

  public subscribeTopic({ topic, options }: WebsocketSubscriptionOptions) {
    this.next({
      action: 'subscribe',
      topic,
      options,
    });
  }

  public updateTopic({ topic, options }: WebsocketSubscriptionOptions) {
    this.next({
      action: 'update',
      topic,
      options,
    });
  }

  public unsubscribeTopic(topic: WebsocketTopic) {
    this.next({
      action: 'unsubscribe',
      topic,
    });
  }

  public complete() {
    this.wsSubject.complete();
  }
}
