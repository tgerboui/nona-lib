import { checkAddress } from 'nanocurrency';
import { z } from 'zod';

/**
 * a username starting with '@' which will be checked with the {@link NanoNameService}
 */
export type NanoUsername = `@${string}`;

export const isValidNanoUsername = (address: string): address is NanoUsername =>
  address.startsWith('@');

/**
 * a Nano address starting with 'nano_'
 */
export type NanoAddress = `nano_${string}`;

export const isValidNanoAddress = (address: string): address is NanoAddress =>
  checkAddress(address);

export const zNanoAddress = (): z.ZodEffects<z.ZodString, NanoAddress, string> =>
  z.string().refine(isValidNanoAddress, 'Invalid nano address');

/**
 * Either a {@link NanoAddress} or a {@link NanoUsername}
 */
export type NanoTarget = NanoAddress | NanoUsername;
