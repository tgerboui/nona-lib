import BigNumber from 'bignumber.js';

export class UnitService {
  public static nanoToRaw(nano: string | number | BigNumber): BigNumber {
    let nanoNumber = nano;
    if (typeof nanoNumber === 'string' || typeof nanoNumber === 'number') {
      nanoNumber = new BigNumber(nano);
    }

    return nanoNumber.shiftedBy(30);
  }

  public static rawToNano(raw: string | number | BigNumber): BigNumber {
    let rawNumber = raw;
    if (typeof rawNumber === 'string' || typeof rawNumber === 'number') {
      rawNumber = new BigNumber(raw);
    }

    return rawNumber.shiftedBy(-30);
  }

  public static nanoToRawString(nano: string | number | BigNumber): string {
    return UnitService.nanoToRaw(nano).toString(10);
  }

  public static rawToNanoString(raw: string | number | BigNumber): string {
    return UnitService.rawToNano(raw).toString(10);
  }
}
