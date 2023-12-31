import { atom } from "jotai";
import { atomWithStorage } from 'jotai/utils'
import BS from "../utils/black_scholes";
import { getAssetFromSymbol } from "../utils/common";


const getTickerUrl = (symbol) => {
  return `https://www.deribit.com/api/v2/public/ticker?instrument_name=${symbol}`
  // return `https://www.deribit.com/api/v2/public/get_index_price?index_name=${price_index}`
}

const getTicker = async (price_index) => {
  try {
    const resp = await fetch(getTickerUrl(price_index))
    const json = await resp.json()
    return {
      instrument_name: json.result.instrument_name,
      index_price: json.result.index_price,
      mark_price: json.result.mark_price,
      mark_iv: json.result.mark_iv,
    }
  } catch (e) {
    console.error(e)
    return null
  }
}

// const getDVolUrl = (asset) => {
//   const endTimestamp = (new Date()).getTime()
//   const startTimestamp = endTimestamp - 10000
//   return `https://www.deribit.com/api/v2/public/get_volatility_index_data?currency=${asset}&resolution=1&start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`
// }
//
// const getDVol = async (asset) => {
//   try {
//     const resp = await fetch(getDVolUrl(asset))
//     const json = await resp.json()
//     const data = json.result.data
//     return data[data.length - 1][1]
//   } catch (e) {
//     return null
//   }
// }

// generate id
// const counter = (() => {
//   let _counter_value = 0
//   return () => {
//     _counter_value += 1
//     return _counter_value
//   }
// })()

// indexPrice

// position
// export const positionAtom = atomWithStorage('greeks_positions', [])
export const positionAtom = atom([])
export const positionWAtom = atom(
  null,
  (get, set, newPositions) => {
    set(positionAtom, newPositions)
  }
)
export const positionCountAtom = atom((get) => {
  return get(positionAtom).length
})
export const positionNeedUpdateAtom = atom((get) => {
  return get(positionAtom).some((p) => p.iv == 0.0 && p.delta == 0.0)
})
export const ethBTCPriceAtom = atom(0)
export const ethBTCPriceRwAtom = atom(
  (get) => get(ethBTCPriceAtom),
  (get, set, newValue) => set(ethBTCPriceAtom, newValue),
)


export const positionRwAtom = atom(
  (get) => get(positionAtom),
  (get, set, newValue) => {
    const position = get(positionAtom)
    const keys = position.map((p) => p.key).sort((a, b) => parseInt(b) - parseInt(a))
    const nextIndex = keys.length > 0 ? parseInt(keys[0]) + 1 : 1
    const findedIndex = position.findIndex((p) => {
      if (p.instrument_name == newValue.instrument_name) {
        return true
      } else {
        return false
      }
    })
    if (findedIndex > -1) {
      if (position[findedIndex].side == newValue.side && newValue.amount > 0.0) {
        position[findedIndex].amount = newValue.amount
        if (newValue.cost && typeof newValue.cost == 'number') {
          position[findedIndex].cost = newValue.cost
          position[findedIndex].mark_price_tc = newValue.cost / position[findedIndex].amount
        }
        // console.log('update position', position)
        set(positionAtom, [...position])
      }
    } else {
      const newPosition = {
        key: nextIndex.toString(),
        side: newValue.side,
        kind: newValue.kind,
        instrument_name: newValue.instrument_name,
        asset: getAssetFromSymbol(newValue.instrument_name),
        amount: newValue.amount,
        expiration_str: newValue.expiration_str,
        expiration_timestamp: newValue.expiration_timestamp,
        quote_currency: newValue.quote_currency,
        base_currency: newValue.base_currency,
        counter_currency: newValue.counter_currency,
        price_index: newValue.price_index,
        option_type: newValue.option_type,
        // need input
        cost: 0.0,
        mark_price_tc: 0.0,
        // need fetch
        strike: newValue.strike,
        index_price: 0.0,
        mark_price: 0.0,
        mark_price_c: 0.0,
        iv: 0.0,
        // need compute
        delta: 0.0,
        gamma: 0.0,
        theta: 0.0,
        vega: 0.0,
      }
      position.push(newPosition)
      // console.log('add new position', position)
      set(positionAtom, [...position])
    }
  }
)

export const indexPricesAtom = atom({})
export const indexPricesRwAtom = atom(
  (get) => get(indexPricesAtom),
  (get, set, newValue) => {
    set(indexPricesAtom, { ...get(indexPricesAtom), ...newValue })
  }
)

export const selectedIndexPricesAtom = atom({})
export const selectedIndexPricesRwAtom = atom(
  (get) => get(selectedIndexPricesAtom),
  (get, set, newValue) => {
    set(selectedIndexPricesAtom, { ...get(selectedIndexPricesAtom), ...newValue })
  }
)
//   (get) => {
//     const positions = get(positionAtom)
//   }
// )


export const refreshPositionAtom = atom(
  null,
  async (get, set) => {
    console.log('----------- hit refresh')
    const positions = get(positionAtom)
    // const assets = Array.from(new Set(positions.map((p) => p.quote_currency)))
    // let dvolTasks = assets.map((d) => getDVol(d))
    const instrument_names = Array.from(new Set(positions.map((p) => p.instrument_name)))
    let instrumentTasks = instrument_names.concat('ETH_BTC').map((p) => getTicker(p))
    const result = await Promise.all(instrumentTasks)

    let cache = {}
    instrument_names.forEach((a, i) => {
      cache[a] = result[i]
    })

    set(ethBTCPriceAtom, result[result.length - 1].index_price)

    let newPositions = []
    for (const p of positions) {
      const K = p.strike
      const S = cache[p.instrument_name].index_price
      const T = (p.expiration_timestamp - (new Date()).getTime()) / (1000 * 60 * 60 * 24 * 365)
      const r = 0.0
      const mark_price = cache[p.instrument_name].mark_price * cache[p.instrument_name].index_price
      const sigma = mark_price != 0.0 ? BS.iv(S, K, T, r, mark_price, p.option_type) : 0.0
      // console.log('[bs]', S, K, T, r, mark_price, p.option_type, sigma, cache[p.instrument_name].mark_iv)
      const isCall = p.option_type == 'call'
      const theta = mark_price != 0.0 ? isCall ? BS.ctheta(S, K, T, r, sigma) : BS.ptheta(S, K, T, r, sigma) : 0.0
      const vega = mark_price != 0.0 ? BS.vega(S, K, T, r, sigma) : 0.0

      newPositions.push({
        ...p,
        index_price: S,
        iv: sigma,
        iv_percent: sigma * 100,
        mark_price: mark_price,
        mark_price_c: mark_price / S,
        delta: mark_price != 0.0 ? isCall ? BS.cdelta(S, K, T, r, sigma) : BS.pdelta(S, K, T, r, sigma) : 0.0,
        gamma: mark_price != 0.0 ? BS.gamma(S, K, T, r, sigma) : 0.0,
        vega: vega,
        vega_percent: vega / 100,
        theta: theta,
        theta_per_day: theta / 365,
      })
    }

    let prices = {}
    for (let p of newPositions) {
      prices[p.quote_currency] = p.index_price
    }
    set(indexPricesAtom, prices)
    set(selectedIndexPricesAtom, prices)
    set(positionAtom, newPositions)
  }
)


export const positionAssetsAtom = atom((get) => {
  const assets = Array.from(new Set(get(positionAtom).map((p) => p.quote_currency)))
  return assets
})


