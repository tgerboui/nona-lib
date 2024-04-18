import { NonaError } from './nona-error';

/**
 * Network error in the Nona application.
 * This is likely due to a network issue.
 * The message is the error message from Axios.
 */
export class NonaNetworkError extends NonaError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
