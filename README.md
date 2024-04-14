# Nona 👵

// TODO: Review introduction  
Typescript client to interact with your Nano node.
This client simplifies the complexities involved in communicating with a Nano node, providing streamlined processes for sending and receiving transactions, retrieving wallet, managing websockets and more.
Start integrating Nano transactions into your applications seamlessly with our easy-to-use Typescript client.

## Table of Contents

// TODO: Set the table of contents

## Installation

// TODO: Review the installation instructions
`npm install @nona/nona`

## Getting Started

// TODO: Create getting started guide

```typescript

```

## Basic Usage

### Create an account

You can simply create a new account with the following code:

```typescript
const { privateKey, publicKey, address } = await nona.key.create();
```

Or from a seed :

```typescript
// Use KeyService to generate a seed or provide your own
const seed = await KeyService.generateSeed();
const { privateKey, publicKey, address } = await nona.key.create(seed);
```

These keys are securely generated locally using the [nanocurrency-js](https://github.com/marvinroger/nanocurrency-js/tree/master/packages/nanocurrency) package.

### Open an account

Before using an account, you need to open it.  
To open an account, you must have sent some funds to it from another account (see [Send a transaction](#send-a-transaction) to send some funds from an opened account).

Then call the open method:

```typescript
// You must provide a representative address to open the account
const reprensentative = 'nano_3rep...';

const wallet = await nona.wallet(privateKey);
await wallet.open(reprensentative);
```

If you don't know how to choose a representative, check out this blog post: [How to choose a representative](https://nano.org/en/blog/how-to-choose-your-nano-representative--74f4c8c4).

### Send a transaction

To send a transaction, you must have an opened account (see [Open an account](#open-an-account)).

```typescript
const receveiver = 'nano_1rece...';
const amount = 2;

const wallet = await nona.wallet(privateKey);
await wallet.send(receveiver, amount);
```

### Receive a transaction

To receive a transaction, you must have an opened account (see [Open an account](#open-an-account)).

To receive a single transaction:

```typescript
const wallet = await nona.wallet(privateKey);
await wallet.receive();
```

If you want to receive all pending transactions:

```typescript
const wallet = await nona.wallet(privateKey);
await wallet.receiveAll();
```

You can also use the websocket to listen and receive transactions in real time:

```typescript
const wallet = await nona.wallet(privateKey);
// Will create a websocket connection, listen for incoming transactions and automatically receives them.
const subscription = await wallet.listenAndReceive({
  // (Optional) next will be called each time a transaction is received
  next: (transactionBlock) => console.log('Received transaction', transactionBlock),
});

// Don't forget to unsubscribe when you don't need it anymore
subscription.unsubscribe();
```

## Nona API

### Wallet

The wallet is the main object to interact with your account.

```typescript
const wallet = await nona.wallet(privateKey);
```

> [!WARNING]  
> This wallet API does not interact with the [wallet RPCs commands](https://docs.nano.org/commands/rpc-protocol/#wallet-rpcs) this naming is only for convenience.

// TODO: Set websocket documentation  
More information about websocket, see [Websocket](#websocket).

## TODO

- [ ] Change options to params in params methods
- [ ] Handle errors
  - [ ] Handle connection errors
  - [ ] Handle format errors
  - [ ] Handle response errors from the node
- [ ] Websocket support
- [ ] Work server options
- [ ] Check integration with nano.to
- [ ] Tests

```

```
