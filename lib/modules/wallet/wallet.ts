import { Subscription } from 'rxjs';

import { KeyService } from '../../services/hash/key-service';
import { NameService } from '../../services/name/name-service';
import { Rpc } from '../../services/rpc/rpc';
import { UnitService } from '../../services/unit/unit-service';
import { NonaUserError } from '../../shared/errors/user-error';
import { NanoAddress, NanoTarget } from '../../shared/utils/address';
import { NonaBigNumber } from '../../shared/utils/big-number';
import { Account } from '../account/account';
import { Blocks } from '../blocks/blocks';
import { ConfirmationBlock } from '../websocket/confirmation/websocket-confirmation-interface';
import { NonaWebSocket } from '../websocket/websocket';
import { WalletListAndReceiveParams } from './wallet-interface';

/**
 * Handle wallet operations such as opening, receiving, sending, and changing representatives.
 */
export class Wallet extends Account {
  public publicKey: string;
  public address: NanoAddress;

  constructor(
    private nameService: NameService,
    private privateKey: string,
    private blocks: Blocks,
    rpc: Rpc,
    websocket: NonaWebSocket,
  ) {
    const publicKey = KeyService.getPublicKey(privateKey);
    const address = KeyService.getAddress(publicKey);

    super(address, websocket, rpc);

    this.nameService = nameService;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.address = address;
  }

  // TODO: Implement optional hash
  /**
   * Opens the account with the provided representative.
   *
   * @param representative The representative to open the wallet with.
   * @returns A promise that resolves to the hash of the opened block.
   */
  public async open(representative: NanoTarget): Promise<string> {
    representative = await this.nameService.resolveTarget(representative);

    // Highest hash
    const lastHashes = await this.receivable({ count: 1, sort: true });
    if (Object.keys(lastHashes).length === 0) {
      throw new NonaUserError('No receivable blocks');
    }

    const link = Object.keys(lastHashes)[0];
    const hashValue = lastHashes[link];

    // Generate work
    const block = await this.blocks.create({
      previous: '0',
      representative,
      account: this.address,
      link,
      balance: hashValue,
      key: this.privateKey,
    });

    // Broadcast to network
    return this.blocks.process(block, 'open');
  }

  /**
   * Receives a pending transaction.
   *
   * @param hash The hash of the transaction to receive. If not provided, a receivable hash will be used.
   * @returns A promise that resolves to the hash of the received block.
   */
  public async receive(hash: string): Promise<string>;
  public async receive(): Promise<string | null>;
  public async receive(hash?: string): Promise<string | null> {
    let receiveHash = hash;

    // If no hash is provided, get a receivable hash
    if (!receiveHash) {
      const receivable = await this.receivable({ count: 1 });
      if (receivable.length === 0) {
        return null;
      }
      receiveHash = receivable[0];
    }

    // Broadcast to network
    return this.receiveHash(receiveHash);
  }

  /**
   * Receives all pending transactions.
   *
   * @param hashes An array of hashes of the transactions to receive. If not provided all pending transactions will be received.
   * @returns A promise that resolves to an array of hashes of the received blocks.
   */
  public async receiveAll(hashes?: string[]): Promise<string[]> {
    if (hashes) {
      return this.receiveHashes(hashes);
    }

    const receivedHashes: string[] = [];
    let hasPending = true;
    while (hasPending) {
      const receivable = await this.receivable({ count: 100 });

      hasPending = receivable.length > 0;
      if (hasPending) {
        const received = await this.receiveHashes(receivable);
        receivedHashes.push(...received);
      }
    }

    return receivedHashes;
  }

  /**
   * Sends a transaction to the specified address.
   *
   * @param target The {@link NanoTarget} to send the transaction to.
   * @param amount The amount to send in nano unit.
   * @returns A promise that resolves to the hash of the sent block.
   */
  public async send(target: NanoTarget, amount: number | string): Promise<string> {
    target = await this.nameService.resolveTarget(target);
    // Convert nano amout to raw amount
    const rawAmount = UnitService.nanoToRaw(amount);
    if (rawAmount.isLessThanOrEqualTo(0) || rawAmount.isNaN()) {
      throw new NonaUserError('Invalid amount');
    }

    const info = await this.info({
      representative: true,
      raw: true,
    });
    const balance = new NonaBigNumber(info.balance);
    if (balance.isLessThan(rawAmount)) {
      throw new NonaUserError('Insufficient balance');
    }
    const finalBalance = balance.minus(rawAmount);
    const receiverPublicKey = KeyService.getPublicKey(target);

    // TODO: Maybe set create block in a function in this class
    const block = await this.blocks.create({
      account: this.address,
      previous: info.frontier,
      representative: info.representative,
      balance: finalBalance.toString(),
      link: receiverPublicKey,
      key: this.privateKey,
    });

    return this.blocks.process(block, 'send');
  }

  /**
   * Listens for incoming transactions and automatically receives them.
   *
   * @param {{ next, error, complete }} params Callback for the listener.
   * @returns A Subscription object that can be used to unsubscribe from the listener.
   */
  public listenAndReceive(params: WalletListAndReceiveParams = {}): Subscription {
    const nextHandler = async (block: ConfirmationBlock): Promise<void> => {
      try {
        await this.receiveHash(block.hash);
        // Send the message to the next callback once the transaction is received
        if (params.next) {
          params.next(block);
        }
      } catch (error) {
        if (params.error) {
          params.error(error);
        }
      }
    };

    return this.listenConfirmation({
      next: nextHandler,
      error: params.error,
      complete: params.complete,
      // Only listen to send transactions to this account
      filter: {
        to: [this.address],
        subtype: ['send'],
      },
    });
  }

  /**
   * Changes the representative of the account.
   *
   * @param representative The new representative to set.
   * @returns A promise that resolves to the hash of the changed block.
   */
  public async change(representative: NanoTarget): Promise<string> {
    representative = await this.nameService.resolveTarget(representative);

    const info = await this.info({
      raw: true,
    });

    const block = await this.blocks.create({
      account: this.address,
      previous: info.frontier,
      representative: representative,
      balance: info.balance,
      link: '0',
      key: this.privateKey,
    });

    return this.blocks.process(block, 'change');
  }

  /**
   * @deprecated Use `receiveAll` instead.
   */
  public async receiveMultipleTransactions(hashes: string[]): Promise<string[]> {
    return this.receiveHashes(hashes);
  }

  /**
   * Receives a hash.
   *
   * @param hash - The hash to be processed.
   * @returns A promise that resolves to the received block.
   */
  private async receiveHash(hash: string): Promise<string> {
    const { balance, representative, frontier } = await this.info({
      representative: true,
      raw: true,
    });

    const hashInfo = await this.blocks.info(hash);
    const finalBalance = NonaBigNumber(balance).plus(hashInfo.amount);

    return await this.blocks.receiveBlock({
      account: this.address,
      previous: frontier,
      representative: representative,
      balance: finalBalance.toString(),
      link: hash,
      key: this.privateKey,
    });
  }

  /**
   * Receives multiple pending transactions.
   *
   * @param hashes An array of hashes of the transactions to receive.
   * @returns A promise that resolves to an array of hashes of the received blocks.
   */
  private async receiveHashes(hashes: string[]): Promise<string[]> {
    if (hashes.length === 0) return [];

    const {
      balance: accountBalance,
      representative,
      frontier,
    } = await this.info({ representative: true, raw: true });

    let balance = new NonaBigNumber(accountBalance);
    let previous = frontier;
    const receivedHashes: string[] = [];

    for (const hash of hashes) {
      const hashInfo = await this.blocks.info(hash);
      balance = balance.plus(hashInfo.amount);

      const processed = await this.blocks.receiveBlock({
        account: this.address,
        previous: previous,
        representative: representative,
        balance: balance.toString(),
        link: hash,
        key: this.privateKey,
      });

      previous = processed;
      receivedHashes.push(processed);
    }

    return receivedHashes;
  }
}
