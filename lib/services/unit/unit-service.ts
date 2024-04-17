import { NonaBigNumber } from '../../shared/utils/big-number';

/**
 * The exponent used to convert between raw and nano.
 */
const NANO_RAW_EXPONENT = 30;

/**
 * The `UnitService` class provides utility methods for converting between different units of a value.
 */
export class UnitService {
  public static nanoToRaw(nano: string | number | NonaBigNumber): NonaBigNumber {
    let nanoNumber = nano;
    if (typeof nanoNumber === 'string' || typeof nanoNumber === 'number') {
      nanoNumber = new NonaBigNumber(nano);
    }

    return nanoNumber.shiftedBy(NANO_RAW_EXPONENT);
  }

  public static rawToNano(raw: string | number | NonaBigNumber): NonaBigNumber {
    let rawNumber = raw;
    if (typeof rawNumber === 'string' || typeof rawNumber === 'number') {
      rawNumber = new NonaBigNumber(raw);
    }

    return rawNumber.shiftedBy(-NANO_RAW_EXPONENT);
  }

  public static nanoToRawString(nano: string | number | NonaBigNumber): string {
    return UnitService.nanoToRaw(nano).toString();
  }

  public static rawToNanoString(raw: string | number | NonaBigNumber): string {
    return UnitService.rawToNano(raw).toString();
  }
}
