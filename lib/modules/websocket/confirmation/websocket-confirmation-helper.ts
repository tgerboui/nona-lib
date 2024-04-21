import { ErrorService } from '../../../services/error/error-service';
import { UnitService } from '../../../services/unit/unit-service';
import { ConfirmationBlock, ConfirmationFilter } from './websocket-confirmation-interface';
import { WebSocketConfirmationMessage } from './websocket-confirmation-schema';

export class WebSocketConfirmationHelper {
  public messageMapper(message: unknown): ConfirmationBlock {
    try {
      const confirmation = WebSocketConfirmationMessage.parse(message);
      const { amount, account, block, hash, confirmation_type } = confirmation;

      const confirmationBlock: ConfirmationBlock = {
        account,
        amount: UnitService.rawToNanoString(amount),
        hash,
        confirmationType: confirmation_type,
        block: {
          account: block.account,
          previous: block.previous,
          representative: block.representative,
          balance: UnitService.rawToNanoString(block.balance),
          link: block.link,
          linkAsAccount: block.link_as_account,
          signature: block.signature,
          work: block.work,
          subtype: block.subtype,
        },
      };

      return confirmationBlock;
    } catch (error) {
      ErrorService.handleError(error);
    }
  }

  public messageFilter(message: ConfirmationBlock, filter?: ConfirmationFilter): boolean {
    if (!filter) return true;

    const { accounts, subtype, from, to } = filter;
    const conditions: boolean[] = [];
    if (accounts) {
      conditions.push(
        accounts.includes(message.account) || accounts.includes(message.block.account),
      );
    }
    if (from) {
      conditions.push(from.includes(message.account));
    }
    if (to && message.block.subtype === 'send') {
      conditions.push(to.includes(message.block.linkAsAccount));
    }
    if (subtype) {
      conditions.push(subtype.includes(message.block.subtype));
    }

    return conditions.every((condition) => condition);
  }
}
