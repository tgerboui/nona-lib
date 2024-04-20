# Nona Lib

[![test](https://github.com/tgerboui/nona-lib/workflows/Test/badge.svg)](https://github.com/tgerboui/nona-lib/actions/workflows/test.yml)
[![coverage](https://img.shields.io/codecov/c/github/tgerboui/nona-lib)](https://codecov.io/gh/tgerboui/nona-lib)
[![GitHub License](https://img.shields.io/github/license/tgerboui/nona-lib)](https://github.com/tgerboui/nona-lib/blob/main/LICENSE)


Nona Lib is a powerful and user-friendly TypeScript library designed to simplify interactions with the Nano cryptocurrency network.  

Whether you're developing wallet software, integrating Nano payments into your application, or just exploring the possibilities of Nano's block lattice structure, Nona Lib provides a comprehensive set of tools to manage accounts, perform transactions, and query blockchain data efficiently and securely through your Nano node.

**Keys Features**

- **Easy Wallet Management**: Manage Nano accounts effortlessly, with functions to create, open, send and receive transactions.
- **Real-Time Updates via Websocket**: Utilize websockets for real-time transaction reception, confirmation tracking, and more.
- **Type Safe**: Fully implemented in TypeScript, providing strong type safety and seamless integration with TypeScript projects.

## Table of contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Basic Usage](#basic-usage)
- [Nona API](#nona-api)
- [Handling Errors](#handling-errors)
- [Disclaimer](#disclaimer)
- [Roadmap](#roadmap)

## Installation

> [!NOTE]
> Before you begin using Nona Lib, ensure that your Nano node's `enable_control` is set to true, as the library requires this permission to perform certain operations.  
> More information on how to configure your node can be found [here](https://docs.nano.org/running-a-node/configuration/#enable-control).

To install Nona Lib, run the following command in your project directory:
  
```bash
npm install nona-lib
```

## Getting Started

If your node runs on localhost with the default port:
```typescript
import { Nona } from 'nona-lib';

const nona = new Nona();
```


If your node runs on a custom port or on a remote server, you can specify the URLs:
```typescript
import { Nona } from 'nona-lib';

const nona = new Nona({ 
  url: 'http://localhost:7076',
  websocketUrl: 'ws://localhost:7078',
});
```

## Basic Usage

### Create an account

You can simply create a new account with the following code:

```typescript
const { privateKey, publicKey, address } = await nona.key.create();
```

Or from a seed:

```typescript
// Use KeyService to generate a seed or provide your own
const seed = await KeyService.generateSeed();
const { privateKey, publicKey, address } = await nona.key.create(seed);
```

These keys are generated locally using the [nanocurrency-js](https://github.com/marvinroger/nanocurrency-js/tree/master/packages/nanocurrency) package.

### Open an account

Before using an account, you need to open it.  
To open an account, you must have sent some funds to it from another account.

Then call the open method:

```typescript
// You must provide a representative address to open the account
const reprensentative = 'nano_3rep...';

const wallet = nona.wallet(privateKey);
await wallet.open(reprensentative);
```

If you don't know how to choose a representative, check out this blog post: [How to choose a representative](https://nano.org/en/blog/how-to-choose-your-nano-representative--74f4c8c4).

### Send a transaction

To send a transaction, you must have an opened account (see [Open an account](#open-an-account)).

```typescript
const receveiver = 'nano_1rece...';
const amount = 2;

const wallet = nona.wallet(privateKey);
await wallet.send(receveiver, amount);
```

### Receive a transaction

To receive a transaction, you must have an opened account (see [Open an account](#open-an-account)).

To receive a single transaction:

```typescript
const wallet = nona.wallet(privateKey);
await wallet.receive();
```

If you want to receive all pending transactions:

```typescript
const wallet = nona.wallet(privateKey);
await wallet.receiveAll();
```

You can also listen and receive transactions in real time:

```typescript
const wallet = nona.wallet(privateKey);
// This will create a websocket connection, listen for incoming transactions, and automatically receive them.
const subscription = await wallet.listenAndReceive({
  // (Optional) next will be called each time a transaction is received
  next: (transactionBlock) => console.log('Received transaction', transactionBlock),
});

// Don't forget to unsubscribe when you don't need it anymore
subscription.unsubscribe();
```

For more details about websocket, see [Websocket](#websocket).

## Nona API

- [Wallet](#wallet)
  - [Open](#open)
  - [Send](#send)
  - [Receive](#receive)
  - [Receive all](#receive-all)
  - [Receive multiple transactions](#receive-multiple-transactions)
  - [Listen and receive](#listen-and-receive)
- [Account](#account)
  - [Receivable](#receivable)
  - [Account info](#account-info)
  - [Balance](#balance)
  - [Listen confirmation](#listen-confirmation)
  - [History](#history)
  - [Block count](#block-count)
  - [Representative](#representative)
  - [Weight](#weight)
- [Websocket](#websocket)
  - [Confirmation](#confirmation)
- [Blocks](#blocks)
  - [Count](#count)
  - [Create block](#create-block)
  - [Process block](#process-block)
  - [Block info](#block-info)
- [Key](#key)
  - [Create](#create)
  - [Expand](#expand)
- [Key Service](#key-service)
  - [Generate seed](#generate-seed)
  - [Get secret key](#get-secret-key)
  - [Get public key](#get-public-key)
  - [Get address](#get-address)
- [Node](#node)
  - [Telemetry](#telemetry)
  - [Uptime](#uptime)
  - [Version](#version)
- [Rpc](#rpc)

## Wallet


> [!NOTE]
> All methods in the [account API](#account) are also available via the wallet object.

> [!WARNING]  
> This wallet API does not interact with the [wallet RPCs commands](https://docs.nano.org/commands/rpc-protocol/#wallet-rpcs) this naming is only for convenience.

The wallet is the main object to interact with your account.

```typescript
const wallet = nona.wallet(privateKey);
```

### Open

```typescript
open(representative: string): Promise<string>
```

Opens the account with the provided representative.  
The first transaction of an account is crafted in a [slightly different way](https://docs.nano.org/integration-guides/key-management/#first-receive-transaction). To open an account, you must have sent some funds to it from another account.  
Returns the hash of the transaction.

```typescript
const representative = 'nano_3rep...';
await wallet.open(representative);
```

### Send

```typescript
send(address: string, amount: number | string): Promise<string>
```

Sends a transaction to the specified address.  
The amount is in nano unit.  
Returns the hash of the transaction.

```typescript
const address = 'nano_1rece...';
const amount = 2;

await wallet.send(address, amount);
```

> [!NOTE]  
> The work is generated by the node, the options to provide or generate the work locally are not yet implemented.

### Receive

```typescript
receive(hash?: string): Promise<string>
```

Receives a pending transaction.  
The hash of the transaction to receive can be provided. If not, a receivable hash will be used.  
Returns the hash of the transaction.

```typescript
await wallet.receive();
```

### Receive all

```typescript
receiveAll(): Promise<string[]>
```

Receives all pending transactions.  
Returns an array of hashes of the received blocks.

```typescript
await wallet.receiveAll();
```

### Receive multiple transactions

```typescript
receiveMultipleTransactions(hashes: string[]): Promise<string[]>
```

Receives multiple pending transactions.  
From an array of hashes of the transactions to receive.  
Returns an array of hashes of the received blocks.

```typescript
const hashes = ['D83124BB...', '1208FF64...'];
await wallet.receiveMultipleTransactions(hashes);
```

### Listen and receive

> [!NOTE]  
> All the webscoket related methods use Rxjs Observables and return a Subscription object. For more information about observables and subscriptions, see the [Rxjs documentation](https://rxjs.dev/).

```typescript
listenAndReceive(params?: WalletListAndReceiveParams): Subscription
```

Listens for incoming transactions and automatically receives them.  
Return a [Subscription](https://rxjs.dev/guide/subscription) object.

```typescript
interface WalletListAndReceiveParams {
  /**
   * A function that will be called each time a transaction is received.
   * @param block The block that was received.
   */
  next?: (block: ConfirmationBlock) => unknown;
  /**
   * A function that will be called when an error occurs.
   * @param error The error that occurred.
   */
  error?: (error: unknown) => unknown;
  /**
   * A function that will be called when the listener completes.
   */
  complete?: () => unknown;
}
```

```typescript
const subscription = await wallet.listenAndReceive({
  next: (transactionBlock) => console.log('Received transaction', transactionBlock),
  error: (error) => console.error('An error occurred', error),
  complete: () => console.log('Subscription completed'),
});

// Don't forget to unsubscribe when you don't need it anymore
subscription.unsubscribe();
```

> [!WARNING]
> Depending on the node setup and sync status, multiple confirmation notifications for the same block hash may be sent by a single tracking mechanism.  
> Theses block will call the `error` function with the error `Unreceivable`.

## Account

> [!NOTE]
> Theses commands are also available using the [wallet](#wallet) object.

All commands related to public account information.  

You can create an account object with the following code:

```typescript
const address = 'nano_13e2ue...';
const account = await nona.account(address);
```

You can also use your [wallet](#wallet) object:

```typescript
const wallet = nona.wallet(privateKey);
````

### Receivable

```typescript
receivable(params?: ReceivableParams): Promise<Receivable>
```

Returns a list of block hashes which have not yet been received by this account.

```typescript
interface ReceivableParams {
  /**
   * Specifies the number of blocks to return.
   * Default to 100.
   */
  count?: number;
  /**
   * Specifies whether to sort the response by block amount.
   * Default to false.
   */
  sort?: boolean;
}
```
Depending on the `sort` parameter, the blocks will be returned in two different ways.

If `sort` is `false` (default), the blocks will be returned as an array of strings:

```typescript
const receivable = await account.receivable();
console.log(receivable);
// ['D83124BB...', '1208FF64...', ...]
```

If `sort` is `true`, the blocks will be returned as an object with the block hash as the key and the amount as the value:

```typescript
const receivable = await account.receivable({ sort: true });
console.log(receivable);
// { 'D83124BB...': 2, '1208FF64...': 1, ... }
```

### Account info

```typescript
info(params?: InfoParams): Promise<AccountInfo>
```

Returns general information for account.  
Only works for accounts that have received their first transaction and have an entry on the ledger, will return "Account not found" otherwise.  
To open an account, use [open](#open).

```typescript
interface InfoParams {
  /**
   * Specifies whether to include the representative in the response.
   * Default to false.
   */
  representative?: boolean;
  /**
   * Specifies whether to return the raw balance.
   * Default to false.
   */
  raw?: boolean;
}
````

```typescript
const info = await account.info();
console.log(info);
// {
//   frontier: '0D60C42554478A2EDAD18AD5E975422297E62082E612C60ECABBDD4D01B65D46',
//   open_block: '92CBCAC62345F58A58CE513652D22BD6E13CB094BF6F8D825DEE01CE54718868',
//   representative_block: '0D60C42253478E2ADAD18AD5E975426297E62082E612C60ECAACDD4D01B65D46',
//   balance: '2.3',
//   modified_timestamp: '1712846889',
//   block_count: '82',
//   account_version: '2',
//   confirmation_height: '82',
//   confirmation_height_frontier: '0D60C22554478E2EDAD81BD5E975426297E62082E612C60ECAACDD4D01B65D46'
// }
```

### Balance

```typescript
balance({ raw = false }: { raw?: boolean }): Promise<AccountBalance>
```

Returns how many nano is owned and how many have not yet been received by account.
Set `raw` to `true` to return the balance in raw unit.

```typescript
const balance = await account.balance();
console.log(balance);
// { balance: '2.3', receivable: '5', pending: '0' }
```

`balance` is the total amount of nano owned by the account.  
`receivable` is the amount of nano that has not yet been received by the account.

> [!NOTE]
> `pending` was deprecated in favor of `receivable`. For compatibility reasons both terms are still available for many calls and in responses.  
> For more details see: https://docs.nano.org/releases/release-v24-0/#pendingreceivable-term-rpc-updates.


### Listen confirmation

```typescript
listenConfirmation(params: ListenConfirmationParams): Subscription
```

Listen for all confirmed blocks for the related account.

```typescript
export interface ListenConfirmationParams {
  /**
   * A function that will be called each time a transaction is received.
   * @param block The block that was received.
   */
  next: (block: ConfirmationBlock) => unknown;
  /**
   * A function that will be called when an error occurs.
   * @param error The error that occurred.
   */
  error?: (error: unknown) => unknown;
  /**
   * A function that will be called when the listener completes.
   */
  complete?: () => unknown;
  /**
   * A filter that will be used to filter the confirmation blocks.
   */
  filter?: ConfirmationFilter;
}

export interface ConfirmationFilter {
  /** List of block subtypes to filter the confirmation blocks. */
  subtype?: string[];
  /** Account addresses that sent the transaction. */
  from?: string[];
  /** Account addresses that received the transaction. */
  to?: string[];
}
````

Listen all sent confirmation blocks for the account from a specific address:

```typescript
const subscription = await account.listenConfirmation({
  next: (transactionBlock) => console.log('Received confirmation', transactionBlock),
  filter: {
    subtype: ['send'],
    from: ['nano_1send...'],
  },
});
```

> [!WARNING]
> Depending on the node setup and sync status, multiple confirmation notifications for the same block hash may be sent by a single tracking mechanism.  
> In order to prevent potential issues, integrations must track these block hashes externally to the node and prevent any unwanted actions based on multiple notifications.

### History

```typescript
history(params?: AccountHistoryParams): Promise<AccountHistory>
```

Retrieves the account history.  
Returns only send & receive blocks by default (unless raw is set to true - see optional parameters below): change, state change & state epoch blocks are skipped, open & state open blocks will appear as receive, state receive/send blocks will appear as receive/send entries.  
Response will start with the latest block for the account (the frontier), and will list all blocks back to the open block of this account when "count" is set to "-1".  

```typescript
export interface AccountHistoryParams {
  /** Number of blocks to return. Default to 100. */
  count?: number;
  /** Hash of the block to start from. */
  head?: string;
  /** Number of blocks to skip. */
  offset?: number;
  /** Reverse order */
  reverse?: boolean;
  /** Results will be filtered to only show sends/receives connected to the provided account(s). */
  accounts?: string[];
  /**
   * if set to true instead of the default false, returns all blocks history and output all parameters of the block itself.
   */
  raw?: boolean;
}
```

```typescript
const history = await account.history();
console.log(history);
// {
//   history: [
//     {
//       type: 'send',
//       account: 'nano_13dtu...',
//       amount: '1.23',
//       hash: 'C43ED22C09...',
//       local_timestamp: '1712846889',
//       height: '82',
//     },
//     [...]
//   ],
//   previous: 'D83124BB...',
// }
```

To paginate the history, you can use the `head` parameter with the `previous` value from the previous call:

```typescript
let hasNext = true;
let head: string | undefined;
while (hasNext) {
  const { history, previous } = await account.history({ head });
  console.log(history);

  if (previous) {
    head = previous;
  } else {
    hasNext = false;
  }
}
```

If `reverse` is `true`, use `next` instead of `previous`.

### Block count

```typescript
blockCount(): Promise<number>
```

Returns the number of blocks for this account.
  
```typescript
const blockCount = await account.blockCount();
console.log(blockCount);
// 42
```

### Representative

```typescript
representative(): Promise<string>
```

Returns the representative for this account.

```typescript
const representative = await account.representative();
console.log(representative);
// nano_3rep...
```

### Weight

```typescript
weight(): Promise<string>
```

Returns the voting weight for this account in nano unit (default).

```typescript
const weight = await account.weight();
console.log(weight);
// 123.456789
```

Set `raw` to `true` to return the weight in raw unit.

```typescript
const weight = await account.weight({ raw: true });
console.log(weight);
// 123456789000000000000000000000000
```

## Websocket

> [!NOTE]  
> All the webscoket related methods use Rxjs Observables and return a Subscription object. For more information about observables and subscriptions, see the [Rxjs documentation](https://rxjs.dev/).

At the first subscription, the websocket connection to the node will be established.  
If all subscriptions are unsubscribed, the connection will be closed.

You can access to the websocket object with the following code:

```typescript
const ws = nona.ws;
```

### Confirmation

```typescript
confirmation(params: WebSocketConfirmationParams): Subscription
```

Listens for confirmed blocks.  
Return a [Subscription](https://rxjs.dev/guide/subscription) object.

```typescript
interface WebSocketConfirmationParams {
  /**
   * A function that will be called each time a transaction is received.
   * @param block The block that was received.
   */
  next: (block: ConfirmationBlock) => unknown;
  /**
   * A function that will be called when an error occurs.
   * @param error The error that occurred.
   */
  error?: (error: unknown) => unknown;
  /**
   * A function that will be called when the listener completes.
   */
  complete?: () => unknown;
  /**
   * A filter that will be used to filter the confirmation blocks.
   */
  filter?: ConfirmationFilter;
}

interface ConfirmationFilter {
  /** List of account addresses to filter the confirmation blocks. */
  accounts?: string[];
  /** List of block subtypes to filter the confirmation blocks. */
  subtype?: string[];
  /** Account addresses that sent the transaction. */
  from?: string[];
  /** Account addresses that received the transaction. */
  to?: string[];
}
```

Subscribe to all new confirmed blocks on the network:

```typescript
const subscription = await nona.ws.confirmation({
  // next will be called each time a transaction is received
  next: (confirmationBlock) => console.log('Received confirmation', confirmationBlock),
});

// Don't forget to unsubscribe when you don't need it anymore
subscription.unsubscribe();
```

Subscribe to all new sent confirmation blocks to a specific account:

```typescript
const subscription = await nona.ws.confirmation({
  next: (block) => console.log('Received confirmation', block),
  filter: {
    subtype: ['send'],
    to: ['nano_1send...'],
  },
});
```

## Blocks

You can access to the blocks object with the following code:

```typescript
const blocks = nona.blocks;
```

### Count

```typescript
count(): Promise<BlockCount>
```

Reports the number of blocks in the ledger and unchecked synchronizing blocks.  
This count represent the node ledger and not the network status.

```typescript
const count = await blocks.count();
console.log(count);
// { count: '198574599', unchecked: '14', cemented: '198574599' }
```

`count` - The total number of blocks in the ledger. This includes all send, receive, open, and change blocks.  
`unchecked` - The number of blocks that have been downloaded but not yet confirmed. These blocks are waiting in the processing queue.  
`cemented` - The number of blocks that have been confirmed and cemented in the ledger. Cemented blocks are confirmed irreversible transactions.  

### Create block

> [!WARNING]
> This method is for advanced usage, use it if you know what you are doing.

```typescript
create(params: CreateBlockParams): Promise<string>
```

Creates a block object based on input data & signed with private key or account in wallet.

Create a send block.
Let's say you want to send 1 nano to `nano_1send...`.
You have currently 3 nano in your account.

```typescript
const wallet = nona.wallet(privateKey);
const info = await wallet.info();
const recipient = 'nano_1send...';

const sendBlock = await this.blocks.create({
  // Current account 
  account: wallet.address,
  // Final balance for account after block creation in raw unit (here: current balance - send amount).
  balance: '2000000000000000000000000000000',
  // The block hash of the previous block on this account's block chain ("0" for first block). 
  previous: info.frontier,
  // The representative account for the account. 
  representative: info.representative,
  // If the block is sending funds, set link to the public key of the destination account.
  // If it is receiving funds, set link to the hash of the block to receive.
  // If the block has no balance change but is updating representative only, set link to 0. 
  link: recipient,
  // Private key of the account 
  key: privateKey,
});
```

### Process block

> [!WARNING]
> This method is for advanced usage, use it if you know what you are doing.

```typescript
process(block: Block, subtype: string): Promise<string>
```

Publish it to the network.
Returns the hash of the published block.

If we want to process the block created in the previous example:

```typescript
await this.blocks.process(sendBlock, 'send');
```

### Block info

```typescript
info(hash: string): Promise<BlockInfo>
```

Retrieves information about a specific block.

```typescript
const hash = 'D83124BB...';
const info = await blocks.info(hash);
```

## Key

You can access to the key object with the following code:

```typescript
const blocks = nona.key;
```

### Create

> [!NOTE]
> The keys are generated locally using the [nanocurrency-js](https://github.com/marvinroger/nanocurrency-js/tree/master/packages/nanocurrency) package.


```typescript
create(seed?: string): Promise<AccountKeys>
```

Create keys for an account.

```typescript
const { privateKey, publicKey, address } = await nona.key.create();
```

### Expand

```typescript
expand(privateKey: string): AccountKeys
```

Expand a private key into public key and address.

```typescript
const { publicKey, address } = nona.key.expand(privateKey);
```

## Key Service

Service to generate seeds and keys.

### Generate seed

```typescript
KeyService.generateSeed(): Promise<string>
```

Generates a random seed.

```typescript
const seed = await KeyService.generateSeed();
```

### Get secret key

```typescript
KeyService.getSecretKey(seed: string, index: number): string
```

Derive a secret key from a seed, given an index.

```typescript
const privateKey = KeyService.getSecretKey(seed, 0);
```

### Get public key

```typescript
KeyService.getPublicKey(privateKey: string): string
```

Derive a public key from a secret key.

```typescript
const publicKey = KeyService.getPublicKey(privateKey);
```

### Get address

```typescript
KeyService.getAddress(publicKey: string): string
```

Derive an address from a public key.

```typescript
const address = KeyService.getAddress(publicKey);
```

## Node

You can access to the node object with the following code:

```typescript
const node = nona.node;
```

### Telemetry

```typescript
telemetry(): Promise<Telemetry>
```

Return metrics from other nodes on the network.
Summarized view of the whole network.

```typescript
const telemetry = await node.telemetry();
```

### Uptime 

```typescript
uptime(): Promise<number>
```

Return node uptime in seconds.

```typescript
const uptime = await node.uptime();
console.log(uptime);
// 832870
```

### Version

```typescript
version(): Promise<Version>
```

Returns version information for RPC, Store, Protocol (network), Node (Major & Minor version).

```typescript
const version = await node.version();
```

## Rpc

if you prefer to call RPC directly you can use `nona.rpc`.

```typescript
rpc(action: string, body?: object): Promise<unknown>
```

Call `account_info` RPC command:

```typescript
const info = await nona.rpc('account_info', {
  account: 'nano_13e2ue...',
});
```

## Handling Errors

All handled errors are instances of `NonaError`.  
Each types of errors are extended from `NonaError` and have a specific instance.

`NonaError` - Base class for all errors and generic error.  
`NonaNetworkError` - Network error, likely related to the node connection.  
`NonaRpcError` - Error related to the RPC call response. If this occured while using the library and you are not using custom RPC call, please report it.  
`NonaParseError` - Error related to the response parsing. If this occured while using the library, please report it.  
`NonaUserError` - Error related to the user input.  
For example, if you try to send a transaction with an insufficient balance:

```typescript
try {
  await wallet.send('nano_1rece...', 100);
} catch (error) {
  if (error instanceof NonaUserError && error.message === 'Insufficient balance') {
    console.log('You don\'t have enough balance to send this amount');
  } else {
    console.error('An error occurred', error);
  }
}
```

## Disclaimer

Nona Lib is a young and evolving TypeScript library designed to interact with the Nano cryptocurrency network. While we strive to ensure reliability and robustness, the following points need to be considered:

- **Early-stage Software**: As an early-stage library, Nona Lib may undergo significant changes with updates that could improve or alter functionalities drastically. Users are advised to keep this in mind when using the library in production environments.

- **Limited Usage**: Given its nascent stage, the library has been subjected to limited usage. This means there could be undiscovered bugs or issues affecting its performance and reliability. We welcome contributions and reports on any anomalies found during usage.

- **Dependency on External Systems**: Nona Lib operates in conjunction with external systems such as Nano nodes, and its performance is highly dependent on the configuration and stability of these systems.

- **Security Risks**: As with any tool managing financial transactions, there is an inherent risk. Users should be cautious and test thoroughly when integrating and deploying Nona Lib in security-sensitive environments.

We encourage the community to contribute to the development and testing of Nona Lib to help us improve its functionality and security. Use this library with caution, and ensure you have robust backup and recovery processes in place.


## Roadmap

### Websocket
  
- [x] Confirmation
  - [ ] Custom filter
- [ ] Vote
- [ ] Start/stop election
- [ ] Active difficulty
- [ ] Proof of work
- [ ] New unconfirmed block

### Proof of work

- [ ] Custom work input
- [ ] Local work generation
- [ ] Custom work server URL

### External services

- [ ] Integration with nano.to

### Tests

- [x] Create unit tests
- [ ] Create integration tests
