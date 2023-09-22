// refer: https://github.com/primitivefinance/rmm-math/blob/main/src/CumulativeNormalDistribution.ts
import gaussian from 'gaussian'

/**
 * @notice Standard Normal Cumulative Distribution Function
 * source: https://github.com/errcw/gaussian/blob/master/lib/gaussian.js
 * @returns CDF of x
 */
export function std_n_cdf(x) {
  return gaussian(0, 1).cdf(x)
}

/**
 * @notice  Standard Normal Probability Density Function
 * source: https://github.com/errcw/gaussian/blob/master/lib/gaussian.js
 * @returns CDF of x
 */
export function std_n_pdf(x) {
  return gaussian(0, 1).pdf(x)
}

/**
 * @notice Quantile function
 * source: https://github.com/errcw/gaussian/blob/master/lib/gaussian.js
 * @returns CDF^-1 of x
 */
export function inverse_std_n_cdf(x) {
  if (x >= 1) return Infinity
  if (x <= 0) return -Infinity
  return gaussian(0, 1).ppf(x)
}

/**
 * uses source: https://github.com/errcw/gaussian/blob/master/lib/gaussian.js
 * @returns CDF(CDF(x)^-1)^-1
 */
export function quantilePrime(x) {
  return gaussian(0, 1).pdf(inverse_std_n_cdf(x)) ** -1
}

const BS = {
  calcD1: function(S, K, T, r, sigma) {
    return (Math.log(S / K) + (r + Math.pow(sigma, 2) / 2) * T) / (sigma * Math.sqrt(T));
  },
  calcD2: function(S, K, T, r, sigma) {
    return this.calcD1(S, K, T, r, sigma) - sigma * Math.sqrt(T);
  },
  calcD1AndD2: function(
    S, K, T, r, sigma
  ) {
    const d1 = this.calcD1(S, K, T, r, sigma);
    const d2 = d1 - sigma * Math.sqrt(T);
    return { d1, d2 }
  },
  calcS: function(S, K, T, r, sigma, phi) {
    return -(S * phi * sigma) / (2 * Math.sqrt(T));
  },

  calcP1AndP2: function(S, K, T, r, sigma) {
    const { d1, d2 } = this.calcD1AndD2(S, K, T, r, sigma)
    const p1 = -S * std_n_pdf(d1) * sigma / (2 * Math.sqrt(T))
    const p2 = r * K * Math.exp(-r * T) * std_n_cdf(d2)
    return { p1, p2 }
  },
  call: function(S, K, T, r, sigma) {
    const { d1, d2 } = this.calcD1AndD2(S, K, T, r, sigma);
    // console.log('d1', d1)
    // console.log('d2', d2)
    var res = Math.max(0, (S * std_n_cdf(d1) - std_n_cdf(d2) * K * Math.exp(-r * T)))
    if (isNaN(res)) {
      return 0;
    }
    return res;
  },
  put: function(S, K, T, r, sigma) {
    const { d1, d2 } = this.calcD1AndD2(S, K, T, r, sigma);
    var res = Math.max(0, (K * Math.pow(Math.E, -r * T) * std_n_cdf(-d2) - S * std_n_cdf(-d1)))
    if (isNaN(res)) {
      return 0;
    }
    return res;
  },
  price: function(S, K, T, r, sigma, type = 'call') {
    if (['call', 'C'].includes(type)) {
      return this.call(S, K, T, r, sigma)
    } else {
      return this.put(S, K, T, r, sigma)
    }
  },
  cdelta: function(S, K, T, r, sigma) {
    var d1 = this.calcD1(S, K, T, r, sigma);
    var res = Math.max(std_n_cdf(d1), 0);
    if (isNaN(res)) {
      return 0;
    }
    return res;
  },
  pdelta: function(S, K, T, r, sigma) {
    var d1 = this.calcD1(S, K, T, r, sigma);
    var res = Math.min(std_n_cdf(d1) - 1, 0);
    if (isNaN(res)) {
      return 0;
    }
    return res;
  },
  delta: function(S, K, T, r, sigma, type = 'call') {
    if (['call', 'C'].includes(type)) {
      return this.cdelta(S, K, T, r, sigma)
    } else {
      return this.pdelta(S, K, T, r, sigma)
    }
  },
  gamma: function(S, K, T, r, sigma) {
    var d1 = this.calcD1(S, K, T, r, sigma)
    var phi = std_n_pdf(d1);
    var res = Math.max(phi / (S * sigma * Math.sqrt(T)), 0);
    if (isNaN(res)) {
      return 0;
    }
    return res;
  },
  vega: function(S, K, T, r, sigma) {
    var d1 = this.calcD1(S, K, T, r, sigma);
    var phi = std_n_pdf(d1);
    // var res = Math.max((S * phi * Math.sqrt(T) / 100), 0);
    var res = Math.max((S * phi * Math.sqrt(T)), 0);
    if (isNaN(res)) {
      return 0;
    }
    return res;

  },
  ctheta: function(S, K, T, r, sigma) {
    const { p1, p2 } = this.calcP1AndP2(S, K, T, r, sigma);
    var res = p1 - p2
    if (isNaN(res)) {
      return 0;
    }
    return res;
  },
  ptheta: function(S, K, T, r, sigma) {
    const { p1, p2 } = this.calcP1AndP2(S, K, T, r, sigma);
    var res = p1 + p2
    if (isNaN(res)) {
      return 0;
    }
    return res;
  },
  theta: function(S, K, T, r, sigma, type = 'call') {
    if (['call', 'C'].includes(type)) {
      return this.ctheta(S, K, T, r, sigma)
    } else {
      return this.ptheta(S, K, T, r, sigma)
    }
  },
  crho: function(S, K, T, r, sigma) {
    var d2 = this.calcD2(S, K, T, r, sigma);
    const res = K * T * Math.exp(-r * T) * std_n_cdf(d2)
    if (isNaN(res)) {
      return 0;
    }
    return res;
  },
  prho: function(S, K, T, r, sigma) {
    var d2 = this.calcD2(S, K, T, r, sigma);
    const res = -K * T * Math.exp(-r * T) * std_n_cdf(-d2)
    if (isNaN(res)) {
      return 0;
    }
    return res;
  },
  rho: function(S, K, T, r, sigma, type = 'call') {
    if (['call', 'C'].includes(type)) {
      return this.crho(S, K, T, r, sigma)
    } else {
      return this.prho(S, K, T, r, sigma)
    }
  },
  iv: function(S, K, T, r, mark_price, type = 'call', max_iteration = 1000, tol = 0.0002, initial_guess = 0.5) {
    let sigma = initial_guess
    for (let i = 0; i < max_iteration; i++) {
      const price = (type == 'call' || type == 'C') ? this.call(S, K, T, r, sigma) : this.put(S, K, T, r, sigma)
      const delta_price = price - mark_price
      if (Math.abs(delta_price) < tol) {
        break
      }
      sigma = sigma - delta_price / this.vega(S, K, T, r, sigma)
    }
    return sigma
  }
};

export default BS
