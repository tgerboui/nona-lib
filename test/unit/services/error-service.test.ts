import { AxiosError } from 'axios';
import { ZodError, ZodIssue, ZodIssueCode } from 'zod';

import { ErrorService } from '../../../lib/services/error/error-service';
import { NonaNetworkError } from '../../../lib/shared/errors/network-error';
import { NonaError } from '../../../lib/shared/errors/nona-error';
import { NonaParseError } from '../../../lib/shared/errors/parse-error';
import { NonaUserError } from '../../../lib/shared/errors/user-error';

describe('ErrorService', () => {
  describe('handleError', () => {
    it('should throw NonaError when error is an instance of NonaError', () => {
      const error = new NonaError('Some error');
      expect(() => ErrorService.handleError(error)).toThrow(NonaError);
    });

    it('should throw NonaNetworkError when error is an instance of AxiosError', () => {
      const error = new AxiosError('Network error');
      expect(() => ErrorService.handleError(error)).toThrow(NonaNetworkError);
    });

    it('should throw NonaParseError when error is an instance of ZodError', () => {
      const zodIssue: ZodIssue = {
        code: ZodIssueCode.invalid_type,
        message: 'Invalid type',
        expected: 'string',
        received: 'number',
        path: [],
      };
      const error = new ZodError([zodIssue]);
      expect(() => ErrorService.handleError(error)).toThrow(NonaParseError);
    });

    it('should throw NonaUserError when error is an instance of UserError', () => {
      const error = new NonaUserError('User error');
      expect(() => ErrorService.handleError(error)).toThrow(NonaUserError);
    });

    it('should throw NonaError when error is an instance of Error', () => {
      const error = new Error('Unknown error');
      expect(() => ErrorService.handleError(error)).toThrow(NonaError);
    });

    it('should throw NonaError when error is of unknown type', () => {
      const error = 'Some unknown error';
      expect(() => ErrorService.handleError(error)).toThrow(NonaError);
    });
  });
});
