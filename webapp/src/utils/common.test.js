import { getAssetFromSymbol, getPriceLimits, getPriceRange, getPriceRangeWithRound, isPromise, round } from "./common"

test('isPromise', () => {
  const promise = new Promise((resolve, reject) => { })
  expect(isPromise(promise)).toBe(true)
})

test('round', () => {
  expect(round(10.333333333333, 0.00001)).toBe(10.33333)
  expect(round(10.555555555555, 0.00001)).toBe(10.55556)
  expect(round(0, 0)).toBe(0)
  expect(round(0, 0.00001)).toBe(0)
  expect(round(0, 1)).toBe(0)
  expect(round(1, 10)).toBe(0)
  expect(round(5, 10)).toBe(10)
  expect(round(10.111)).toBe(10)
  expect(round(10.501)).toBe(11)
  expect(round(13, 10)).toBe(10)
  expect(round(16, 10)).toBe(20)
  expect(round(111111111111111.1, 10)).toBe(111111111111110)
  expect(round(666666666666666.1, 10)).toBe(666666666666670)
  expect(round(26596.13, 100)).toBe(26600)
})

test('getPriceLimits', () => {
  expect(getPriceLimits(100, 5)).toStrictEqual([0, 500])
  expect(getPriceLimits(100, 2)).toStrictEqual([0, 200])
  expect(getPriceLimits(100, 2.5)).toStrictEqual([0, 250])
})

test('getPriceRange', () => {
  expect(getPriceRange(100, 2, 10)).toStrictEqual([0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200])
})

test('getAssetFromSymbol', () => {
  expect(getAssetFromSymbol('BTC-29SEP23-27500-C')).toBe('BTC')
  expect(getAssetFromSymbol('ETH-29SEP23')).toBe('ETH')
  expect(getAssetFromSymbol('ETHUSDT')).toBe('ETH')
})

// test('getPriceRangeWithRound', () => {
//   expect(getPriceRangeWithRound(28915.23)).toStrictEqual([])
// })

