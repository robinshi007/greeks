import { atom } from "jotai";
import { getPriceRange, getPriceRangeWithRound } from "../utils/common";
import BS from "../utils/black_scholes";

const defaultDeltaChartOption = {
  animation: false,
  grid: {
    top: 20,
    left: 50,
    right: 40,
    bottom: 100
  },
  xAxis: {
    name: 'x',
    // minorTick: {
    //   show: true
    // },
    minorSplitLine: {
      show: true
    }
  },
  yAxis: {
    name: 'y',
    // minorTick: {
    //   show: true
    // },
    minorSplitLine: {
      show: true
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  dataZoom: [
    {
      type: 'inside',
      start: 20,
      end: 80,
    },
    {
      start: 20,
      end: 80,
    }
  ],

  series: [
    {
      type: 'line',
      showSymbol: false,
      clip: true,
      data: [],
    }
  ]
}

export const deltaChartOptonAtom = atom({
  "BTC": {
    ...defaultDeltaChartOption,
  },
  "ETH": {
    ...defaultDeltaChartOption,
  }
})
export const deltaChartOptonRwAtom = atom(
  (get) => get(deltaChartOptonAtom),
  (get, set, asset, data, currentPrice, previousOption) => {
    let option = get(deltaChartOptonAtom)
    const newOption = {
      ...option[asset],
      ...{
        "dataZoom": previousOption.dataZoom
      },
      ...{
        title: {
          text: asset,
          color: '#333',
        },
        series: [
          {
            type: 'line',
            showSymbol: false,
            clip: true,
            data: data,
            markLine: {
              data: [{
                name: "Current price",
                xAxis: currentPrice,
                label: {
                  formatter: '{b}: {c}',
                  show: true,
                  color: '#1e90ff',
                  fontWeight: 'bold',
                },
                lineStyle: {
                  normal: {
                    type: 'dashed',
                    color: '#1e90ff',
                  }
                },
              }],
            }
          }
        ]
      }
    }
    console.log('option', option)
    console.log('newOption', { ...option, ...{ [asset]: newOption } })
    set(deltaChartOptonAtom, { ...option, ...{ [asset]: newOption } })
  }
)


const getPositionsDelta = (S, r, now_ms, positions) => {
  return positions.reduce((acc, p) => {
    const T = (p.expiration_timestamp - now_ms) / (1000 * 60 * 60 * 24 * 365)
    return acc + BS.delta(S, p.strike, T, r, p.iv, p.option_type)
  }, 0)
}

export const generateDeltaData = (assetPrice, positions) => {
  if (assetPrice) {
    const assetPriceRange = getPriceRangeWithRound(assetPrice, 2)
    const now_ms = (new Date()).getTime()
    if (positions.length > 0) {
      const r = 0.0
      return assetPriceRange.map((S) => {
        return [S, getPositionsDelta(S, r, now_ms, positions)]
      })
    } else {
      return []
    }
  }
  return []
}
