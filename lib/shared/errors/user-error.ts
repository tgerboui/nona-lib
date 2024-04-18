import { NonaError } from './nona-error';

/**
 * An error that is specific to user-related issues in the Nona application.
 */
export class NonaUserError extends NonaError {
  constructor(message: string) {
    super(message);
    this.name = 'UserError';
  }
}
