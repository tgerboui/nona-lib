export type WebsocketActions = 'subscribe' | 'unsubscribe' | 'update';
export type WebsocketTopic =
  | 'confirmation'
  | 'vote'
  | 'stopped_election'
  | 'started_election'
  | 'active_difficulty'
  | 'work'
  | 'telemetry'
  | 'new_unconfirmed_block'
  | 'bootstrap';

export interface WebSocketManagerMessage {
  topic: WebsocketTopic;
  time: string;
  message: unknown;
}

export interface WebSocketManagerNext {
  action: WebsocketActions;
  topic: string;
  options?: unknown;
}

export interface WebsocketSubscriptionOptions {
  topic: WebsocketTopic;
  options?: unknown;
}

export interface WebsocketUpdateOptions {
  topic: WebsocketTopic;
  subOptions?: unknown;
  unSubOptions?: unknown;
}

export interface WebsocketNext {
  action: WebsocketActions;
  topic: WebsocketTopic;
  options?: unknown;
}
