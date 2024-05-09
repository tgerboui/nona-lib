import crypto from 'crypto';
import { deriveAddress } from 'nanocurrency';
import { NanoAddress } from '../../lib/shared/utils/address';

/**
 * Create a simple valid random public key
 * See: https://docs.nano.org/integration-guides/the-basics/#account-public-key
 *
 * @returns a 32 byte value, represented as an uppercase hexadecimal string
 */
export const randomPublicKey = (): string => {
  return crypto.randomBytes(32).toString('hex').toUpperCase();
};

/**
 * Creates a valid nano address by generating a random public key with {@link randomPublicKey}
 *
 * @param useNanoPrefix - if true, the address will be prefixed with 'nano_'
 * @returns the nano address
 */
export const randomNanoAddress = (useNanoPrefix = true): NanoAddress => {
  const publicKey = randomPublicKey();
  // convert it
  return deriveAddress(publicKey, {
    useNanoPrefix,
  }) as NanoAddress;
};

/**
 * Creates multiple nano addresses with {@link randomNanoAddress}
 *
 * @param length - the number of addresses to generate
 * @param useNanoPrefix - if true, the addresses will be prefixed with 'nano_'
 * @returns an array of nano addresses with the specificed length
 */
export const randomNanoAddresses = (length: number, useNanoPrefix = true): NanoAddress[] => {
  return Array.from({ length }, (_v, _i) => randomNanoAddress(useNanoPrefix));
};
