import { deriveAddress, derivePublicKey, deriveSecretKey, generateSeed } from 'nanocurrency';

export class KeyService {
  /**
   * Generate a cryptographically secure seed.
   *
   * @returns Promise fulfilled with seed, in hexadecimal format
   */
  public static generateSeed(): Promise<string> {
    return generateSeed();
  }

  /**
   * Derive a private key from a seed, given an index.
   *
   * @param seed - The seed to generate the private key from, in hexadecimal format
   * @param index - The index to generate the private key from
   * @returns Private key, in hexadecimal format
   */
  public static getPrivateKey(seed: string, index: number): string {
    return deriveSecretKey(seed, index);
  }

  /**
   * Derive a public key from a private key.
   *
   * @param privateKeyOrAddress - Private key or adress to derive the public key from, in hexadecimal or address format
   * @returns Public key, in hexadecimal format
   */
  public static getPublicKey(privateKeyOrAddress: string): string {
    return derivePublicKey(privateKeyOrAddress);
  }

  /**
   * Derive address from a public key.
   *
   * @param publicKey - The public key to generate the address from, in hexadecimal format
   * @returns Address
   */
  public static getAddress(publicKey: string): string {
    return deriveAddress(publicKey, {
      useNanoPrefix: true,
    });
  }
}
