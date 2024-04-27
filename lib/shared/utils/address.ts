import { z } from 'zod';

/**
 * a Nano address starting with 'nano_'
 */
export type NanoAddress = `nano_${string}`;

export const isValidNanoAddress = (address: string): address is NanoAddress =>
  address.startsWith('nano_');

export const zNanoAddress = (): z.ZodEffects<z.ZodString, NanoAddress, string> =>
  z.string().refine(isValidNanoAddress, "Address has to start with 'nano_'");
