import { deriveAddress, derivePublicKey } from 'nanocurrency';

export class KeyService {
  static getPublicKey(privateKey: string) {
    return derivePublicKey(privateKey);
  }

  static getAddress(publicKey: string) {
    return deriveAddress(publicKey, {
      useNanoPrefix: true,
    });
  }
}
