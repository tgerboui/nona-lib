// TODO: Document each field
export interface WebSocketConfirmationParams {
  next: (message: ConfirmationMessage) => unknown;
  complete?: () => unknown;
  error?: (error: unknown) => unknown;
  filter?: ConfirmationFilter;
}

export interface WebSocketUpdateConfirmationParams {
  accountsAdd?: string[];
  accountsDel?: string[];
}

// TODO: Explain each field
export interface ConfirmationMessage {
  from: string;
  to: string;
  amount: string;
  subtype: string;
  hash: string;
  previous: string;
  work: string;
  link: string;
}

export interface ConfirmationFilter {
  accounts?: string[];
  subtype?: string;
}
