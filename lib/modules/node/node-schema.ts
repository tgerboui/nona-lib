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

export const Telemetry = z.object({
  block_count: z.string(),
  cemented_count: z.string(),
  unchecked_count: z.string(),
  account_count: z.string(),
  bandwidth_cap: z.string(),
  peer_count: z.string(),
  protocol_version: z.string(),
  uptime: z.string(),
  genesis_block: z.string(),
  major_version: z.string(),
  minor_version: z.string(),
  patch_version: z.string(),
  pre_release_version: z.string(),
  maker: z.string(),
  timestamp: z.string(),
  active_difficulty: z.string(),
});
export type Telemetry = z.infer<typeof Telemetry>;

export const uptimeSchema = z.object({
  seconds: z.string(),
});
