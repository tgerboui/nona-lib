import { AxiosError } from 'axios';
import { ZodError } from 'zod';

import { NonaNetworkError } from '../../shared/errors/network-error';
import { NonaError } from '../../shared/errors/nona-error';
import { NonaParseError } from '../../shared/errors/parse-error';

export class ErrorService {
  public static handleError(error: unknown): never {
    if (error instanceof NonaError) {
      throw error;
    } else if (error instanceof AxiosError) {
      throw new NonaNetworkError(error.message);
    } else if (error instanceof ZodError) {
      throw new NonaParseError(error.message);
    } else if (error instanceof Error) {
      throw new NonaError(error.message);
    }

    throw new NonaError('An unknown error occurred');
  }
}
