import BigNumber from 'bignumber.js';
import { Subscription } from 'rxjs';

import { KeyService } from '../../services/hash/key-service';
import { Account } from '../account/account';
import { Blocks } from '../blocks/blocks';
import { WalletListAndReceiveParams } from './wallet-interface';
import { UnitService } from '../../services/unit/unit-service';
import { Rpc } from '../../services/rpc/rpc';
import { NonaWebSocket } from '../websocket/websocket';

export class Wallet extends Account {
  public publicKey: string;
  public address: string;

  // TODO: Change this interface
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
  // TODO: Set options in interface
  public async open(representative: string): Promise<string> {
    // Highest hash
    const lastHashes = await this.receivable({ count: 1, sort: true });
    if (Object.keys(lastHashes).length === 0) {
      throw new Error('No receivable blocks');
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

  /// Receive a pending transaction
  public async receive(hash?: string): Promise<string> {
    const info = await this.info(true);
    let receiveHash = hash;

    // If no hash is provided, get a receivable hash
    if (!receiveHash) {
      const receivable = await this.receivable({ count: 1 });
      if (receivable.length === 0) {
        throw new Error('No receivable blocks');
      }
      receiveHash = receivable[0];
    }

    // Get hash info
    const hashInfo = await this.blocks.info(receiveHash);
    const finalBalance = BigNumber(info.balance).plus(hashInfo.amount);

    // Generate work and format block
    const block = await this.blocks.create({
      account: this.address,
      previous: info.frontier,
      representative: info.representative,
      balance: finalBalance.toString(10),
      link: receiveHash,
      key: this.privateKey,
    });

    // Broadcast to network
    return this.blocks.process(block, 'receive');
  }

  public async receiveHashes(hashes: string[]): Promise<string[]> {
    const info = await this.info(true);
    let balance = new BigNumber(info.balance);
    let previous = info.frontier;
    const receivedHashes: string[] = [];

    for (const hash of hashes) {
      const hashInfo = await this.blocks.info(hash);
      balance = balance.plus(hashInfo.amount);

      const block = await this.blocks.create({
        account: this.address,
        previous: previous,
        representative: info.representative,
        balance: balance.toString(10),
        link: hash,
        key: this.privateKey,
      });
      const processed = await this.blocks.process(block, 'receive');
      previous = processed;
      receivedHashes.push(processed);
    }

    return receivedHashes;
  }

  /// Receive all pending transactions
  public async receiveAll(): Promise<string[]> {
    const receivedHashes: string[] = [];

    let receivable = await this.receivable({ count: 100 });
    while (receivable.length > 0) {
      const received = await this.receiveHashes(receivable);
      receivedHashes.push(...received);
      receivable = await this.receivable({ count: 100 });
    }

    return receivedHashes;
  }

  // TODO: Create send raw and add string to parameters
  public async send(address: string, amount: number | string): Promise<string> {
    const info = await this.info(true);
    const balance = new BigNumber(info.balance);
    // Convert nano amout to raw amount
    const rawAmount = UnitService.nanoToRaw(amount);

    if (balance.isLessThan(amount)) {
      throw new Error('Insufficient balance');
    }

    // TODO: Maybe set create block in a function in this class
    const block = await this.blocks.create({
      account: this.address,
      previous: info.frontier,
      representative: info.representative,
      balance: balance.minus(rawAmount).toString(10),
      link: address,
      key: this.privateKey,
    });

    return this.blocks.process(block, 'send');
  }

  // The account need to be opened to receive transactions
  public listenAndReceive(params?: WalletListAndReceiveParams): Subscription {
    return this.listenConfirmation({
      next: (message) => {
        params?.next && params?.next(message);
        // Receive the transaction
        this.receive(message.hash);
      },
      error: params?.error,
      complete: params?.complete,
      // Only listen to send transactions to this account
      filter: {
        to: [this.address],
        subtype: ['send'],
      },
    });
  }
}
