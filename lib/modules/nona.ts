import { Rpc } from '../services/rpc/rpc';
import { Blocks } from './blocks/blocks';

export class Nona {
  rpc: Rpc;
  blocks: Blocks;

  constructor(url = 'http://localhost:7076') {
    this.rpc = new Rpc({ url });
    this.blocks = new Blocks(this.rpc);
  }
}
