import {
  messageFilter,
  messageMapper,
} from '../../../../../lib/modules/websocket/confirmation/websocket-confirmation-helper';
import { NonaParseError } from '../../../../../lib/shared/errors/parse-error';

describe('WebSocket Confirmation Functions', () => {
  describe('messageMapper', () => {
    it('should map a confirmation message to a ConfirmationBlock', () => {
      const mockMessage = {
        account: 'fromAccount',
        amount: '1000000000000000000000000000000', // 1 nano in raw unit
        hash: 'hashValue',
        confirmation_type: 'confirmation_type',
        block: {
          type: 'typeValue',
          account: 'toAccount',
          previous: 'previousHash',
          representative: 'representativeValue',
          balance: 'balanceValue',
          link: 'linkValue',
          link_as_account: 'toAccount',
          signature: 'signatureValue',
          work: 'workValue',
          subtype: 'send',
        },
      };

      const result = messageMapper(mockMessage);

      expect(result).toEqual({
        from: 'fromAccount',
        to: 'toAccount',
        amount: '1', // Converted in nano
        subtype: 'send',
        hash: 'hashValue',
        previous: 'previousHash',
        work: 'workValue',
        link: 'linkValue',
        confirmationType: 'confirmation_type',
      });
    });

    it('should handle parsing errors and log them', () => {
      try {
        const badMessage = { badData: 'invalid' };
        messageMapper(badMessage);
        // If the function does not throw an error, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NonaParseError);
      }
    });
  });

  describe('messageFilter', () => {
    const mockConfirmationBlock = {
      from: 'fromAccount',
      to: 'toAccount',
      amount: '1',
      subtype: 'send',
      hash: 'hashValue',
      previous: 'previousHash',
      work: 'workValue',
      link: 'linkValue',
      confirmationType: 'active',
    };

    it('should return true when no filter is applied', () => {
      expect(messageFilter(mockConfirmationBlock)).toBe(true);
    });

    it('should return true when an empty filter is applied', () => {
      expect(messageFilter(mockConfirmationBlock, {})).toBe(true);
    });

    it('should filter messages based on the from account', () => {
      const filter = { from: ['fromAccount'] };
      const result = messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(true);
    });

    it('should filter messages based on the to account', () => {
      const filter = { to: ['toAccount'] };
      const result = messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(true);
    });

    it('should filter messages based on the subtype', () => {
      const filter = { subtype: ['send'] };
      const result = messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(true);
    });

    it('should filter messages based on the from and to accounts', () => {
      const filter = { accounts: ['fromAccount', 'toAccount'] };
      const result = messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(true);
    });

    it('should filter messages based on a complex filter', () => {
      const filter = {
        accounts: ['fromAccount', 'anotherAccount'],
        from: ['fromAccount'],
        to: ['toAccount'],
        subtype: ['send', 'receive'],
      };
      const result = messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(true);
    });

    it('should return false when conditions are not met', () => {
      const filter = {
        accounts: ['wrongAccount'],
        from: ['wrongFrom'],
        to: ['wrongTo'],
        subtype: ['open'],
      };
      const result = messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(false);
    });
  });
});
