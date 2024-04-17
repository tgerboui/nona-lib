import { NonaBigNumber } from '../../shared/utils/big-number';

export class UnitService {
  public static nanoToRaw(nano: string | number | NonaBigNumber): NonaBigNumber {
    let nanoNumber = nano;
    if (typeof nanoNumber === 'string' || typeof nanoNumber === 'number') {
      nanoNumber = new NonaBigNumber(nano);
    }

    return nanoNumber.shiftedBy(30);
  }

  public static rawToNano(raw: string | number | NonaBigNumber): NonaBigNumber {
    let rawNumber = raw;
    if (typeof rawNumber === 'string' || typeof rawNumber === 'number') {
      rawNumber = new NonaBigNumber(raw);
    }

    return rawNumber.shiftedBy(-30);
  }

  public static nanoToRawString(nano: string | number | NonaBigNumber): string {
    return UnitService.nanoToRaw(nano).toString();
  }

  public static rawToNanoString(raw: string | number | NonaBigNumber): string {
    return UnitService.rawToNano(raw).toString();
  }
}
