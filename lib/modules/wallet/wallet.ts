import { Subscription } from 'rxjs';

import { KeyService } from '../../services/hash/key-service';
import { Rpc } from '../../services/rpc/rpc';
import { UnitService } from '../../services/unit/unit-service';
import { NonaUserError } from '../../shared/errors/user-error';
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
  public address: string;

  constructor(
    private privateKey: string,
    private blocks: Blocks,
    rpc: Rpc,
    websocket: NonaWebSocket,
  ) {
    const publicKey = KeyService.getPublicKey(privateKey);
    const address = KeyService.getAddress(publicKey);

    super(address, websocket, rpc);

    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.address = address;
  }

  // TODO: Implement optional hash
  /**
   * Opens the account with the provided representative.
   * @param representative The representative to open the wallet with.
   * @returns A promise that resolves to the hash of the opened block.
   */
  public async open(representative: string): Promise<string> {
    // Highest hash
    const lastHashes = await this.receivable({ count: 1, sort: true });
    if (Object.keys(lastHashes).length === 0) {
      throw new NonaUserError('No receivable blocks');
    }
    const hash = Object.keys(lastHashes)[0];
    const hashValue = lastHashes[hash];

    // Generate work
    const block = await this.blocks.create({
      previous: '0',
      representative,
      account: this.address,
      link: hash,
      balance: hashValue,
      key: this.privateKey,
    });

    // Broadcast to network
    return this.blocks.process(block, 'open');
  }

  /**
   * Receives a pending transaction.
   * @param hash The hash of the transaction to receive. If not provided, a receivable hash will be used.
   * @returns A promise that resolves to the hash of the received block.
   */
  public async receive(hash?: string): Promise<string> {
    const info = await this.info({
      representative: true,
      raw: true,
    });
    let receiveHash = hash;

    // If no hash is provided, get a receivable hash
    if (!receiveHash) {
      const receivable = await this.receivable({ count: 1 });
      if (receivable.length === 0) {
        throw new NonaUserError('No receivable blocks');
      }
      receiveHash = receivable[0];
    }

    // Get hash info
    const hashInfo = await this.blocks.info(receiveHash);
    const finalBalance = NonaBigNumber(info.balance).plus(hashInfo.amount);

    // Generate work and format block
    const block = await this.blocks.create({
      account: this.address,
      previous: info.frontier,
      representative: info.representative,
      balance: finalBalance.toString(),
      link: receiveHash,
      key: this.privateKey,
    });

    // Broadcast to network
    return this.blocks.process(block, 'receive');
  }

  /**
   * Receives multiple pending transactions.
   * @param hashes An array of hashes of the transactions to receive.
   * @returns A promise that resolves to an array of hashes of the received blocks.
   */
  public async receiveMultipleTransactions(hashes: string[]): Promise<string[]> {
    if (hashes.length === 0) {
      return [];
    }

    const info = await this.info({
      representative: true,
      raw: true,
    });
    let balance = new NonaBigNumber(info.balance);
    let previous = info.frontier;
    const receivedHashes: string[] = [];

    for (const hash of hashes) {
      const hashInfo = await this.blocks.info(hash);
      balance = balance.plus(hashInfo.amount);

      const block = await this.blocks.create({
        account: this.address,
        previous: previous,
        representative: info.representative,
        balance: balance.toString(),
        link: hash,
        key: this.privateKey,
      });
      const processed = await this.blocks.process(block, 'receive');
      previous = processed;
      receivedHashes.push(processed);
    }

    return receivedHashes;
  }

  /**
   * Receives all pending transactions.
   * @returns A promise that resolves to an array of hashes of the received blocks.
   */
  public async receiveAll(): Promise<string[]> {
    const receivedHashes: string[] = [];

    let hasPending = true;
    while (hasPending) {
      const receivable = await this.receivable({ count: 100 });

      hasPending = receivable.length > 0;
      if (hasPending) {
        const received = await this.receiveMultipleTransactions(receivable);
        receivedHashes.push(...received);
      }
    }

    return receivedHashes;
  }

  /**
   * Sends a transaction to the specified address.
   * @param address The address to send the transaction to.
   * @param amount The amount to send in nano unit.
   * @returns A promise that resolves to the hash of the sent block.
   */
  public async send(address: string, amount: number | string): Promise<string> {
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

    // TODO: Maybe set create block in a function in this class
    const block = await this.blocks.create({
      account: this.address,
      previous: info.frontier,
      representative: info.representative,
      balance: finalBalance.toString(),
      link: address,
      key: this.privateKey,
    });

    return this.blocks.process(block, 'send');
  }

  /**
   * Listens for incoming transactions and automatically receives them.
   * @param {{ next, error, complete }} params Callback for the listener.
   * @returns A Subscription object that can be used to unsubscribe from the listener.
   */
  public listenAndReceive(params: WalletListAndReceiveParams = {}): Subscription {
    const nextHandler = async (block: ConfirmationBlock) => {
      try {
        await this.receive(block.hash);
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
      error: params?.error,
      complete: params?.complete,
      // Only listen to send transactions to this account
      filter: {
        to: [this.address],
        subtype: ['send'],
      },
    });
  }

  /**
   * Changes the representative of the account.
   * @param representative The new representative to set.
   * @returns A promise that resolves to the hash of the changed block.
   */
  public async change(representative: string): Promise<string> {
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
}
