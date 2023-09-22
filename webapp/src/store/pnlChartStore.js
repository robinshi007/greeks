import { atom } from "jotai";
import { getPriceRangeWithRound } from "../utils/common";

export const baseCurrencyAtom = atom('COIN')
export const baseCurrencyRAtom = atom(
  (get) => get(baseCurrencyAtom),
  (get, set, newValue) => {
    if (['USD', 'COIN'].includes(newValue)) {
      set(baseCurrencyAtom, newValue)
    } else {
      console.log(`${newValue} is not supported as base currency`)
    }
  }
)
export const isCoinBaseCurrencydAtom = atom(
  (get) => get(baseCurrencyAtom) == 'COIN',
)
export const settleCurrencyAtom = atom('USD')
export const isCoinSettleCurrencydAtom = atom(
  (get) => get(settleCurrencyAtom) == 'COIN',
)
export const settleCurrencyRwAtom = atom(
  (get) => get(settleCurrencyAtom),
  (get, set, newValue) => {
    if (['USD', 'COIN'].includes(newValue)) {
      set(settleCurrencyAtom, newValue)
    } else {
      console.log(`${newValue} is not supported as settle currency`)
    }
  }
)

export const pnlChartOptonAtom = atom({
  animation: false,
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    top: 40,
    left: 50,
    right: 60,
    bottom: 80
  },
  toolbox: {
    feature: {
      // dataZoom: {
      //   yAxisIndex: 'none'
      // },
      // restore: {},
      // saveAsImage: {}
    }
  },
  xAxis: {
    name: 'x',
    minorSplitLine: {
      show: true
    }
  },
  yAxis: {
    name: 'y',
    minorSplitLine: {
      show: true
    }
  },
  dataZoom: [
    {
      type: 'inside',
      start: 25,
      end: 75,
    },
    {
      start: 25,
      end: 75,
    }
  ],
  series: [
    {
      type: 'line',
      showSymbol: false,
      clip: true,
      data: [],
    }
  ],
})
export const pnlChartOptonRwAtom = atom(
  (get) => get(pnlChartOptonAtom),
  (get, set, data, strikes) => {
    let option = get(pnlChartOptonAtom)
    option = {
      ...option,
      ...{
        series: [
          {
            type: 'line',
            showSymbol: false,
            clip: true,
            data: data,
            markLine: {
              data: strikes.map((s) => {
                return {
                  name: "strike price",
                  xAxis: s,
                  lineStyle: {
                    normal: {
                      type: 'dashed',
                      color: '#1e90ff',
                    }
                  },
                }
              }),
            }
          }
        ]
      }
    }
    set(pnlChartOptonAtom, option)
  }
)


const getPositionPnl = (S, Mc, K, T, r, sigma, amount, option_type, side, isCoinSettleCurrency) => {
  let res = 0
  if (isCoinSettleCurrency) {
    if (['call', 'C'].includes(option_type)) {
      if (side == 'buy') {
        res = Math.max(S - K, 0) / S - Mc
      } else {
        res = Mc - Math.max(S - K, 0) / S
      }
    } else {
      if (side == 'buy') {
        res = Math.max(K - S, 0) / S - Mc
      } else {
        res = Mc - Math.max(K - S, 0) / S
      }
    }

  } else {
    if (['call', 'C'].includes(option_type)) {
      if (side == 'buy') {
        res = Math.max(S - K, 0) - Mc * S
      } else {
        res = Mc * S - Math.max(S - K, 0)
      }
    } else {
      if (side == 'buy') {
        res = Math.max(K - S, 0) - Mc * S
      } else {
        res = Mc * S - Math.max(K - S, 0)
      }
    }
  }
  return res * amount
}

const getPositionsPnl = (S, r, now_ms, positions, isCoinSettleCurrency) => {
  return positions.reduce((acc, p) => {
    const T = (p.expiration_timestamp - now_ms) / (1000 * 60 * 60 * 24 * 365)
    return acc + getPositionPnl(S, p.mark_price_c, p.strike, T, r, p.iv, p.amount, p.option_type, p.side, isCoinSettleCurrency)
  }, 0)
}

export const generatePnlData = (assetPrice, positions, isCoinSettleCurrency) => {
  const assetPriceRange = getPriceRangeWithRound(assetPrice, 2.5)
  const now_ms = (new Date()).getTime()
  if (positions.length > 0) {
    const r = 0.0
    return assetPriceRange.map((S) => {
      return [S, getPositionsPnl(S, r, now_ms, positions, isCoinSettleCurrency)]
    })
  } else {
    return []
  }
}
