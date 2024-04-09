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
  /** Average count of blocks in ledger (including unconfirmed) */
  block_count: z.string(),
  /** Average count of blocks cemented in ledger (only confirmed) */
  cemented_count: z.string(),
  /** Average count of unchecked blocks. This should only be considered an estimate as nodes running RocksDB may not return exact counts. */
  unchecked_count: z.string(),
  /** Average count of accounts in ledger */
  account_count: z.string(),
  /** 0 = unlimited; the mode is chosen if there is more than 1 common result otherwise the results are averaged (excluding 0) */
  bandwidth_cap: z.string(),
  /** Average count of peers nodes are connected to */
  peer_count: z.string(),
  /** Most common protocol version */
  protocol_version: z.string(),
  /** Average number of seconds since the UTC epoch at the point where the response is sent from the peer */
  uptime: z.string(),
  /** Mode of genesis block hashes */
  genesis_block: z.string(),
  /** Most common major version */
  major_version: z.string(),
  /** Most common minor version */
  minor_version: z.string(),
  /** Most common patch version */
  patch_version: z.string(),
  /** Most common pre release version */
  pre_release_version: z.string(),
  /** Most common, meant for third party node software implementing the protocol so that it can be distinguished, 0 = Nano Foundation, 1 = Nano Foundation pruned node */
  maker: z.string(),
  /** Number of milliseconds since the UTC epoch at the point where the response is sent from the peer */
  timestamp: z.string(),
  /** Minimum network difficulty due to deprecated active difficulty measurements */
  active_difficulty: z.string(),
});
export type Telemetry = z.infer<typeof Telemetry>;

export const uptimeSchema = z.object({
  seconds: z.string(),
});
