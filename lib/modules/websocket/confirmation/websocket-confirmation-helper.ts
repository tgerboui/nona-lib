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

export function messageFilter(message: ConfirmationMessage, params: ConfirmationFilter): boolean {
  const isAccountsIncluded =
    params.accounts.includes(message.from) || params.accounts.includes(message.to);
  if (params.subtype) {
    return isAccountsIncluded && params.subtype === message.subtype;
  }
  return isAccountsIncluded;
}
