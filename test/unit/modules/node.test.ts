import { Node } from '../../../lib/modules/node/node';
import { Rpc } from '../../../lib/services/rpc/rpc';

jest.mock('../../../lib/services/rpc/rpc');

describe('Node class', () => {
  let node: Node;
  let rpcMock: jest.Mocked<Rpc>;

  beforeEach(() => {
    rpcMock = new Rpc({ url: 'http://example.com' }) as jest.Mocked<Rpc>;
    node = new Node(rpcMock);
  });

  describe('telemetry', () => {
    it('should fetch telemetry data from the network', async () => {
      const telemetryData = {
        block_count: '198618812',
        cemented_count: '198618808',
        unchecked_count: '16',
        account_count: '36817175',
        bandwidth_cap: '10485760',
        peer_count: '164',
        protocol_version: '20',
        uptime: '2677701',
        genesis_block: '991CF190094C00F0B68E2E5F75F6BEE95A2E0BD93CEAA4A6734DB9F19B728948',
        major_version: '26',
        minor_version: '1',
        patch_version: '0',
        pre_release_version: '0',
        maker: '0',
        timestamp: '1713537981272',
        active_difficulty: 'fffffff800000000',
      };
      rpcMock.call.mockResolvedValue(telemetryData);

      const result = await node.telemetry();
      expect(rpcMock.call).toHaveBeenCalledWith('telemetry');
      expect(result).toEqual(telemetryData);
    });
  });

  describe('uptime', () => {
    it('should fetch and return the node uptime in seconds', async () => {
      const uptimeData = { seconds: '3600' };
      rpcMock.call.mockResolvedValue(uptimeData);

      const result = await node.uptime();
      expect(rpcMock.call).toHaveBeenCalledWith('uptime');
      expect(result).toBe(3600);
    });
  });

  describe('version', () => {
    it('should fetch and return version information of the node', async () => {
      const versionData = {
        rpc_version: '1',
        store_version: '22',
        protocol_version: '20',
        node_vendor: 'Nano V26.1',
        store_vendor: 'LMDB 0.9.70',
        network: 'live',
        network_identifier: '991CF190094Q00F0A68E1E5F75F6BEE95A2E0BD93CEBA4A6734DB9F19B728928',
        build_info: '66d74ff "GNU C++ version " "11.4.0" "BOOST 108200" BUILT "Feb 26 2024"',
      };
      rpcMock.call.mockResolvedValue(versionData);
      node.parseHandler = jest.fn().mockReturnValue(versionData);

      const result = await node.version();
      expect(rpcMock.call).toHaveBeenCalledWith('version');
      expect(result).toEqual(versionData);
    });
  });
});
