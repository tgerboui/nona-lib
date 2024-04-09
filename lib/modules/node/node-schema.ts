import { z } from 'zod';

export const Version = z.object({
  rpc_version: z.string(),
  store_version: z.string(),
  protocol_version: z.string(),
  node_vendor: z.string(),
  store_vendor: z.string(),
  network: z.string(),
  network_identifier: z.string(),
  build_info: z.string(),
});
export type Version = z.infer<typeof Version>;
