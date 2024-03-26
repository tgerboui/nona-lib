import { UnitService } from '../../../services/unit/unit-service';
import { ConfirmationFilter, ConfirmationMessage } from './websocket-confirmation-interface';
import { WebSocketConfirmationMessage } from './websocket-confirmation-schema';

export function messageMapper(message: unknown): ConfirmationMessage {
  // TODO: Handle zod parsing errors
  const confirmation = WebSocketConfirmationMessage.parse(message);

  return {
    from: confirmation.account,
    to: confirmation.block.link_as_account,
    amount: UnitService.rawToNano(confirmation.amount).toString(10),
    subtype: confirmation.block.subtype,
    hash: confirmation.hash,
    previous: confirmation.block.previous,
    work: confirmation.block.work,
    link: confirmation.block.link,
  };
}

export function messageFilter(message: ConfirmationMessage, filter?: ConfirmationFilter): boolean {
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
