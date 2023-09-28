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
export const isCoinBaseCurrencyAtom = atom(
  (get) => get(baseCurrencyAtom) == 'COIN',
)
export const settleCurrencyAtom = atom('USD')
export const isCoinSettleCurrencyAtom = atom(
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

const defaultPnlChartOption = {
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
}
export const pnlChartOptionAtom = atom({
  "BTC": {
    ...defaultPnlChartOption,
  },
  "ETH": {
    ...defaultPnlChartOption,
  }
})
export const pnlChartOptionRwAtom = atom(
  (get) => get(pnlChartOptionAtom),
  (get, set, asset, data, strikes, selectedIndexPrice, previousOption) => {
    let option = get(pnlChartOptionAtom)
    // console.log('old Option', previousOption)
    const newOption = {
      ...option[asset],
      ...{
        "dataZoom": previousOption.dataZoom
      },
      ...{
        title: {
          text: asset
        },
        series: [
          {
            type: 'line',
            showSymbol: false,
            clip: true,
            data: data,
            markLine: {
              data: strikes.map((s) => ({
                name: "Strike price",
                xAxis: s,
                label: {
                  formatter: '{b}: {c}',
                  show: true,
                  position: 'insideMiddleTop',

                  color: '#1e90ff',
                  fontWeight: 'bold',
                },
                lineStyle: {
                  normal: {
                    type: 'dashed',
                    color: '#1e90ff',
                  }
                },
              })).concat({
                symbol: 'none',
                name: "Simulated price",
                label: {
                  formatter: '{b}: {c}',
                  show: true,
                  // position: 'insideMiddleTop',
                  color: 'red',
                  fontWeight: 'bold',
                },
                xAxis: typeof selectedIndexPrice == 'number' ? selectedIndexPrice : 0,
                lineStyle: {
                  normal: {
                    type: 'solid',
                    color: 'red',
                  }
                },
              }),
            }
          }
        ]
      }
    }

    // console.log('new Option', newOption)
    set(pnlChartOptionAtom, { ...option, ...{ [asset]: newOption } })
  }
)


const getPositionPnl = (S, Mtc, Mcc, K, T, r, sigma, amount, option_type, side, isCoinSettleCurrency) => {
  let res = 0
  const Mc = Mtc != 0.0 ? Mtc : Mcc
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

export const getPositionsPnl = (S, r, now_ms, positions, isCoinSettleCurrency) => {
  return positions.reduce((acc, p) => {
    const T = (p.expiration_timestamp - now_ms) / (1000 * 60 * 60 * 24 * 365)
    return acc + getPositionPnl(S, p.mark_price_tc, p.mark_price_c, p.strike, T, r, p.iv, p.amount, p.option_type, p.side, isCoinSettleCurrency)
  }, 0)
}

export const generatePnlData = (assetPrice, positions, isCoinSettleCurrency) => {
  if (assetPrice) {
    const assetPriceRange = getPriceRangeWithRound(assetPrice, 2)
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
  return []
}
