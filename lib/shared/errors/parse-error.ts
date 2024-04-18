import { NonaError } from './nona-error';

/**
 * An error that occurs during parsing an RPC response.
 */
export class NonaParseError extends NonaError {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}
