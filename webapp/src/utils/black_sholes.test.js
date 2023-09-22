import BS from './black_scholes.js'

test("BS call", () => {
  const S = 26838, K = 25000, T = 10 / 365, r = 0.05, sigma = 0.4142
  expect(BS.call(S, K, T, r, sigma)).toBe(2005.2431717607215)
  expect(BS.cdelta(S, K, T, r, sigma)).toBe(0.8619307020329565)
  expect(BS.gamma(S, K, T, r, sigma)).toBe(0.00011982856658202142)
  expect(BS.vega(S, K, T, r, sigma)).toBe(979.4401239084995)
  expect(BS.ctheta(S, K, T, r, sigma)).toBe(-8460.097463112921)
  expect(BS.crho(S, K, T, r, sigma)).toBe(578.8288495725963)

  expect(BS.put(S, K, T, r, sigma)).toBe(133.0200422696189)
  expect(BS.pdelta(S, K, T, r, sigma)).toBe(-0.13806929796704348)
  expect(BS.ptheta(S, K, T, r, sigma)).toBe(-6347.3721621729455)
  expect(BS.prho(S, K, T, r, sigma)).toBe(-105.16503729066112)

})

test("BS iv", () => {
  expect(
    BS.iv(100.0, 115.0, 1, 0.05, 18, "C")
  ).toBe(0.5428424882587186)
  expect(
    BS.iv(100.0, 115.0, 1, 0.05, 18, "P")
  ).toBe(0.306859599408595)
  expect(
    BS.iv(1590, 1650, 0.0000446, 0.0, 59.8193, "P")
  ).toBe(0)
})
