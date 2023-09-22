import { atom } from "jotai";
import { getStrikeOptionTypeStr } from "../utils/greeks";


// utils
const getInstrumentsUrl = (asset, kind = 'option') => {
  return `https://www.deribit.com/api/v2/public/get_instruments?currency=${asset}&kind=${kind}`
}

const getInstruments = async (asset) => {
  const resp = await fetch(getInstrumentsUrl(asset))
  const json = await resp.json()
  // console.log(json.result)
  return json.result.map((i) => {
    if (i.instrument_name) {
      const instrument_parts = i.instrument_name.split('-')
      return {
        kind: i.kind,
        option_type: i.option_type,
        instrument_id: i.instrument_id,
        instrument_name: i.instrument_name,
        instrument_type: i.instrument_type,
        strike: i.strike ? i.strike : '',
        expiration_timestamp: i.expiration_timestamp,
        expiration_str: instrument_parts.length == 4 ? instrument_parts[1] : instrument_parts.length == 2 ? instrument_parts[1] : '',
        quote_currency: i.quote_currency,
        base_currency: i.base_currency,
        counter_currency: i.counter_currency,
        contract_size: i.contract_size,
        min_trade_amount: i.min_trade_amount,
        tick_size: i.tick_size,
        settlement_period: i.settlement_period,
        settlement_currency: i.settlement_currency,
        price_index: i.price_index,
        is_active: i.is_active,
      }
    } else {
      return null
    }
  }).filter((i) => i != null && i.is_active == true)
}

// atoms
export const instruments = atom([])

export const instrumentsAtom = atom(
  (get) => get(instruments),
  async (get, set) => {
    const result = await Promise.all([
      getInstruments('BTC'),
      getInstruments('ETH')
    ])
    set(instruments, result.flat().sort((a, b) => {
      if (a.quote_currency == b.quote_currency) {
        if (a.expiration_timestamp == b.expiration_timestamp) {
          return a.strike - b.strike
        }
        return a.expiration_timestamp - b.expiration_timestamp
      }
      return a.quote_currency.localeCompare(b.quote_currency);
    }))
  }
)

export const selectedAsset = atom('BTC')
export const selectedRWAsset = atom(
  (get) => get(selectedAsset),
  (get, set, newValue) => {
    set(selectedAsset, newValue)
  })

export const selectedExpireStr = atom("")
export const selectedRWExpireStr = atom(
  (get) => get(selectedExpireStr),
  (get, set, newValue) => {
    set(selectedExpireStr, newValue)
  })

export const selectedStrike = atom("")
export const selectedRWStrike = atom(
  (get) => get(selectedStrike),
  (get, set, newValue) => {
    set(selectedStrike, newValue)
  })

export const filteredInstrumentsAtom = atom(
  (get) => {
    const data = get(instruments)
    if (Array.isArray(data)) {
      if (get(selectedStrike) && get(selectedExpireStr) && get(selectedAsset)) {
        return data.filter((i) => i.quote_currency == get(selectedAsset) && i.expiration_str == get(selectedExpireStr) && getStrikeOptionTypeStr(i) == get(selectedStrike))
      } else if (get(selectedExpireStr) && get(selectedAsset)) {
        return data.filter((i) => i.quote_currency == get(selectedAsset) && i.expiration_str == get(selectedExpireStr))
      } else if (get(selectedAsset)) {
        return data.filter((i) => i.quote_currency == get(selectedAsset))
      } else {
        return data
      }
    } else {
      return []
    }
  }
)

