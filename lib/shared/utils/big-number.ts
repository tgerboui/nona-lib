import BigNumber from 'bignumber.js';

export const NonaBigNumber = BigNumber.clone({
  EXPONENTIAL_AT: 1e9,
  DECIMAL_PLACES: 36,
});
export type NonaBigNumber = BigNumber;
