import { deriveAddress, derivePublicKey } from 'nanocurrency';

export class KeyService {
  static getPublicKey(privateKey: string) {
    return derivePublicKey(privateKey);
  }

  static getAccount(publicKey: string) {
    return deriveAddress(publicKey, {
      useNanoPrefix: true,
    });
  }
}
