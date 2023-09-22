import { atom } from "jotai";
import { getPriceRange, getPriceRangeWithRound } from "../utils/common";
import BS from "../utils/black_scholes";
import { isCombinedPositionAtom } from "./positionStore";

const getPositionsDelta = (S, r, now_ms, positions) => {
  return positions.reduce((acc, p) => {
    const T = (p.expiration_timestamp - now_ms) / (1000 * 60 * 60 * 24 * 365)
    return acc + BS.delta(S, p.strike, T, r, p.iv, p.option_type)
  }, 0)
}

export const generateDeltaData = (assetPrice, positions) => {
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

export const deltaChartOptonAtom = atom({
  animation: false,
  grid: {
    top: 20,
    left: 50,
    right: 40,
    bottom: 100
  },
  xAxis: {
    name: 'x',
    // min: -100,
    // max: 100,
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
      markLine: {
        data: [{
          name: "strike price",
          xAxis: 24,
          // label: {
          //   normal: {
          //     show: false,
          //   }
          // },
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
})
export const deltaChartOptonRwAtom = atom(
  (get) => get(deltaChartOptonAtom),
  (get, set, data) => {
    let option = get(deltaChartOptonAtom)
    option = {
      ...option,
      ...{
        series: [
          {
            type: 'line',
            showSymbol: false,
            clip: true,
            data: data,
            // markLine: {
            //   data: [{
            //     name: "strike price",
            //     xAxis: 24,
            //     lineStyle: {
            //       normal: {
            //         type: 'dashed',
            //         color: '#1e90ff',
            //       }
            //     },
            //   }],
            // }
          }
        ]
      }
    }
    set(deltaChartOptonAtom, option)
  }
)

