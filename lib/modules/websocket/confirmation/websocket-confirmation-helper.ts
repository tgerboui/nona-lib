import { ErrorService } from '../../../services/error/error-service';
import { UnitService } from '../../../services/unit/unit-service';
import { ConfirmationBlock, ConfirmationFilter } from './websocket-confirmation-interface';
import { WebSocketConfirmationMessage } from './websocket-confirmation-schema';

export function messageMapper(message: unknown): ConfirmationBlock {
  try {
    const confirmation = WebSocketConfirmationMessage.parse(message);
    const { amount, account, block, hash, confirmation_type } = confirmation;

    return {
      from: account,
      to: block.link_as_account,
      amount: UnitService.rawToNanoString(amount),
      subtype: block.subtype,
      hash: hash,
      previous: block.previous,
      work: block.work,
      link: block.link,
      confirmationType: confirmation_type,
    };
  } catch (error) {
    ErrorService.handleError(error);
  }
}

export function messageFilter(message: ConfirmationBlock, filter?: ConfirmationFilter): boolean {
  if (!filter) return true;

  const { accounts, subtype, from, to } = filter;
  const conditions: boolean[] = [];
  if (accounts) {
    conditions.push(accounts.includes(message.from) || accounts.includes(message.to));
  }
  if (from) {
    conditions.push(from.includes(message.from));
  }
  if (to) {
    conditions.push(to.includes(message.to));
  }
  if (subtype) {
    conditions.push(subtype.includes(message.subtype));
  }

  return conditions.every((condition) => condition);
}
