import { UnitService } from '../../../lib/services/unit/unit-service';
import { NonaBigNumber } from '../../../lib/shared/utils/big-number';

describe('UnitService', () => {
  describe('nanoToRaw', () => {
    it('should convert nano string to raw', () => {
      const nano = '933246399.309182309812033584526326431744';
      const expectedRaw = new NonaBigNumber('933246399309182309812033584526326431744');
      const result = UnitService.nanoToRaw(nano);
      expect(result).toEqual(expectedRaw);
    });

    it('should convert nano number to raw', () => {
      const nano = 933246399.3091;
      const expectedRaw = new NonaBigNumber('933246399309100000000000000000000000000');
      const result = UnitService.nanoToRaw(nano);
      expect(result).toEqual(expectedRaw);
    });

    it('should convert nano BigNumber to raw', () => {
      const nano = new NonaBigNumber('933246399.309182309812036033055475040256');
      const expectedRaw = new NonaBigNumber('933246399309182309812036033055475040256');
      const result = UnitService.nanoToRaw(nano);
      expect(result).toEqual(expectedRaw);
    });

    it('should convert nano string to raw string', () => {
      const nano = '933246399.309182309812036398265362743296';
      const expectedRaw = '933246399309182309812036398265362743296';
      const result = UnitService.nanoToRawString(nano);
      expect(result).toEqual(expectedRaw);
    });
  });

  describe('rawToNano', () => {
    it('should convert raw string to nano', () => {
      const raw = '933246399309182309812033584526326431744';
      const expectedNano = new NonaBigNumber('933246399.309182309812033584526326431744');
      const result = UnitService.rawToNano(raw);
      expect(result).toEqual(expectedNano);
    });

    it('should convert raw number to nano', () => {
      const raw = 933246399309100000000000000000000000000;
      const expectedNano = new NonaBigNumber('933246399.3091');
      const result = UnitService.rawToNano(raw);
      expect(result).toEqual(expectedNano);
    });

    it('should convert raw BigNumber to nano', () => {
      const raw = new NonaBigNumber('933246399309182309812036033055475040256');
      const expectedNano = new NonaBigNumber('933246399.309182309812036033055475040256');
      const result = UnitService.rawToNano(raw);
      expect(result).toEqual(expectedNano);
    });

    it('should convert raw string to nano string', () => {
      const raw = '933246399309182309812036398265362743296';
      const expectedNano = '933246399.309182309812036398265362743296';
      const result = UnitService.rawToNanoString(raw);
      expect(result).toEqual(expectedNano);
    });
  });
});
