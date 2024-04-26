import { z } from 'zod';

export type NanoAddress = `nano_${string}`;

export const isValidNanoAddress = (address: string): address is NanoAddress =>
  address.startsWith('nano_');

export const zNanoAddress = () =>
  z.string().refine(isValidNanoAddress, "Address has to start with 'nano_'");
