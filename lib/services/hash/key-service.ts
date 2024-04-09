import { deriveAddress, derivePublicKey } from 'nanocurrency';

export class KeyService {
  static getPublicKey(privateKey: string): string {
    return derivePublicKey(privateKey);
  }

  static getAddress(publicKey: string): string {
    return deriveAddress(publicKey, {
      useNanoPrefix: true,
    });
  }
}
