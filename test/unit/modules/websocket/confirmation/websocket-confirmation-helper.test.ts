import { WebSocketConfirmationHelper } from '../../../../../lib/modules/websocket/confirmation/websocket-confirmation-helper';
import { NonaParseError } from '../../../../../lib/shared/errors/parse-error';

describe('WebSocket Confirmation Functions', () => {
  let websocketConfirmationHelper: WebSocketConfirmationHelper;

  beforeEach(() => {
    websocketConfirmationHelper = new WebSocketConfirmationHelper();
  });

  describe('messageMapper', () => {
    it('should map a confirmation message to a ConfirmationBlock', () => {
      const mockMessage = {
        account: 'rootAccount',
        amount: '1000000000000000000000000000000', // 1 nano in raw unit
        hash: 'hashValue',
        confirmation_type: 'confirmation_type',
        block: {
          type: 'typeValue',
          account: 'blockAccount',
          previous: 'previousHash',
          representative: 'representativeValue',
          balance: '2000000000000000000000000000000',
          link: 'linkValue',
          link_as_account: 'toAccount',
          signature: 'signatureValue',
          work: 'workValue',
          subtype: 'send',
        },
      };

      const result = websocketConfirmationHelper.messageMapper(mockMessage);

      expect(result).toEqual({
        account: 'rootAccount',
        amount: '1',
        hash: 'hashValue',
        confirmationType: 'confirmation_type',
        block: {
          account: 'blockAccount',
          previous: 'previousHash',
          representative: 'representativeValue',
          balance: '2',
          link: 'linkValue',
          linkAsAccount: 'toAccount',
          signature: 'signatureValue',
          work: 'workValue',
          subtype: 'send',
        },
      });
    });

    it('should handle parsing errors and log them', () => {
      try {
        const badMessage = { badData: 'invalid' };
        websocketConfirmationHelper.messageMapper(badMessage);
        // If the function does not throw an error, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(NonaParseError);
      }
    });
  });

  describe('messageFilter', () => {
    const mockConfirmationBlock = {
      account: 'rootAccount',
      amount: '1',
      hash: 'hashValue',
      confirmationType: 'confirmation_type',
      block: {
        account: 'blockAccount',
        previous: 'previousHash',
        representative: 'representativeValue',
        balance: '2',
        link: 'linkValue',
        linkAsAccount: 'toAccount',
        signature: 'signatureValue',
        work: 'workValue',
        subtype: 'send',
      },
    };

    it('should return true when no filter is applied', () => {
      const result = websocketConfirmationHelper.messageFilter(mockConfirmationBlock);
      expect(result).toBe(true);
    });

    it('should return true when an empty filter is applied', () => {
      const result = websocketConfirmationHelper.messageFilter(mockConfirmationBlock, {});
      expect(result).toBe(true);
    });

    it('should filter messages based on the to account', () => {
      const filter = { to: ['toAccount'] };
      const result = websocketConfirmationHelper.messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(true);
    });

    it('should filter messages based on the subtype', () => {
      const filter = { subtype: ['send'] };
      const result = websocketConfirmationHelper.messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(true);
    });

    it('should filter messages based on the receive account', () => {
      const filter = { accounts: ['toAccount'] };
      const result = websocketConfirmationHelper.messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(true);
    });

    it('should filter out account that are not in the to', () => {
      const filter = { accounts: ['rootAccount'], to: ['rootAccount'] };
      const result = websocketConfirmationHelper.messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(false);
    });

    it('should filter messages based on a complex filter', () => {
      const filter = {
        accounts: ['rootAccount', 'toAccount'],
        to: ['toAccount'],
        subtype: ['send'],
      };
      const result = websocketConfirmationHelper.messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(true);
    });

    it('should return false when conditions are not met for account', () => {
      const filter = { accounts: ['wrongAccount'] };
      const result = websocketConfirmationHelper.messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(false);
    });

    it('should return false when conditions are not met for to', () => {
      const filter = { to: ['wrongTo'] };
      const result = websocketConfirmationHelper.messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(false);
    });

    it('should return false when conditions are not met for subtype', () => {
      const filter = { subtype: ['open'] };
      const result = websocketConfirmationHelper.messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(false);
    });

    it('should return false when conditions are not met', () => {
      const filter = {
        accounts: ['wrongAccount'],
        to: ['wrongTo'],
        subtype: ['open'],
      };
      const result = websocketConfirmationHelper.messageFilter(mockConfirmationBlock, filter);

      expect(result).toBe(false);
    });
  });
});
