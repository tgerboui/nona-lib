import { KeyService } from '../../services/hash/key-service';
import { RpcConsummer } from '../rpc-consumer/rpc-consumer';
import { AccountKeys } from './key-interface';

export class Key extends RpcConsummer {
  /**
   * Create keys for an account
   *
   * @param seed - Seed to generate the keys
   * @returns Private key, public key and address
   */
  public async create(seed?: string): Promise<AccountKeys> {
    let generativeSeed = seed;
    if (!generativeSeed) {
      generativeSeed = await KeyService.generateSeed();
    }

    const privateKey = KeyService.getSecretKey(generativeSeed, 0);
    const publicKey = KeyService.getPublicKey(privateKey);
    const address = KeyService.getAddress(publicKey);

    return {
      privateKey,
      publicKey,
      address,
    };
  }

  /**
   * Expand a private key to public key and address
   *
   * @param privateKey private key to expand
   * @returns public key and address
   */
  public expand(privateKey: string): AccountKeys {
    return {
      privateKey: privateKey,
      publicKey: KeyService.getPublicKey(privateKey),
      address: KeyService.getAddress(KeyService.getPublicKey(privateKey)),
    };
  }
}
