/**
 * Represents an error specific to the Nona application.
 */
export class NonaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonaError';
  }
}
