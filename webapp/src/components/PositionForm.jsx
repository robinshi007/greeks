
import { useAtom } from "jotai"
import { Button, Card, Col, Form, InputNumber, Row, Select, Slider, Space, Spin, Tabs } from "antd"
import { useEffect, useState } from "react"
import AntIcon from "../components/AntIcon"
import { filteredInstrumentsAtom, instrumentsAtom, selectedRWAsset, selectedRWExpireStr, selectedRWStrike } from "../store/instrumentStore"
import { getStrikeOptionTypeStr } from "../utils/greeks"
import { ethBTCPriceAtom, indexPricesRwAtom, positionRwAtom, selectedIndexPricesRwAtom } from "../store/positionStore"
import { getPriceLimits, getPriceStep, toFixed } from "../utils/common"
import { getPositionsPnl, isCoinSettleCurrencyAtom } from "../store/pnlChartStore"

const PositionForm = () => {
  const [instruments, updateInstruments] = useAtom(instrumentsAtom)

  const [selectedAsset, updateSelectedAsset] = useAtom(selectedRWAsset)
  const [selectedExpireStr, updateSelectedExpireStr] = useAtom(selectedRWExpireStr)
  const [selectedStrike, updateSelectedStrike] = useAtom(selectedRWStrike)
  const [amount, updateAmount] = useState(0)

  const [filteredInstruments] = useAtom(filteredInstrumentsAtom)
  const [positions, updatePositions] = useAtom(positionRwAtom)
  const [indexPrices, updateIndexPrices] = useAtom(indexPricesRwAtom)
  const [selectedIndexPrices, updateSelectedIndexPrices] = useAtom(selectedIndexPricesRwAtom)
  const [isCoinSettleCurrency] = useAtom(isCoinSettleCurrencyAtom)
  const [ethBTCPrice] = useAtom(ethBTCPriceAtom)

  const [pnls, setPnls] = useState({})

  const onSliderChange = (asset, newValue) => {
    updateSelectedIndexPrices({ [asset]: newValue })
  };


  useEffect(() => {
    updateInstruments()
  }, [])

  const onFormBuy = (e) => {
    if (filteredInstruments && filteredInstruments.length == 1 && amount != 0.0) {
      const instrument = filteredInstruments[0]
      // console.log('buy', instrument.instrument_name, amount)
      updatePositions({
        side: 'buy',
        kind: instrument.kind,
        instrument_name: instrument.instrument_name,
        expiration_str: instrument.expiration_str,
        expiration_timestamp: instrument.expiration_timestamp,
        strike: instrument.strike,
        quote_currency: instrument.quote_currency,
        base_currency: instrument.base_currency,
        counter_currency: instrument.counter_currency,
        price_index: instrument.price_index,
        option_type: instrument.option_type,
        amount: amount,
      })
      // reset
      // updateSelectedStrike("")
      updateAmount(0)
    }
  }

  const onFormSell = (e) => {
    if (filteredInstruments && filteredInstruments.length == 1 && amount != 0.0) {
      const instrument = filteredInstruments[0]
      // console.log('sell', instrument.instrument_name, amount)
      updatePositions({
        side: 'sell',
        kind: instrument.kind,
        instrument_name: instrument.instrument_name,
        expiration_str: instrument.expiration_str,
        expiration_timestamp: instrument.expiration_timestamp,
        strike: instrument.strike,
        quote_currency: instrument.quote_currency,
        base_currency: instrument.base_currency,
        counter_currency: instrument.counter_currency,
        price_index: instrument.price_index,
        option_type: instrument.option_type,
        amount: amount,
      })

      // reset
      // updateSelectedStrike("")
      updateAmount(0)
    }
  }

  const filterOption = (input, option) => {
    return option.label.toLowerCase().includes(input.toLowerCase());
  }

  const tabItems = [
    {
      label: <div style={{ padding: '0 4px 0 4px' }}>Create position</div>,
      key: '1',
      children: (
        <>
          {
            filteredInstruments.length != 0 ? (
              <Form layout="vertical" style={{ margin: "0 12px 0 12px" }}>
                <Form.Item label="Asset">
                  <Select defaultValue={selectedAsset} value={selectedAsset} onChange={(e) => {
                    updateSelectedAsset(e)
                    updateSelectedExpireStr("")
                    updateSelectedStrike("")
                  }} options={
                    Array.from(new Set(instruments.map((i) => i.quote_currency))).map((a) => ({
                      value: a,
                      label: a,
                    }))
                  } />
                </Form.Item>
                <Form.Item label="Expiry Date">
                  <Select defaultValue={selectedExpireStr} value={selectedExpireStr} onChange={(e) => {
                    updateSelectedExpireStr(e)
                    updateSelectedStrike("")
                  }} allowClear onClear={(e) => {
                    updateSelectedExpireStr("")
                    updateSelectedStrike("")
                  }} options={
                    Array.from(new Set(filteredInstruments.map((i) => i.expiration_str))).map((e) => ({
                      value: e,
                      label: e.length == 6 ? `0${e.slice(0, 1)} ${e.slice(1, 4)} ${e.slice(4, 6)}` : `${e.slice(0, 2)} ${e.slice(2, 5)} ${e.slice(5, 7)}`,
                    }))
                  } />
                </Form.Item>
                <Form.Item label="Strike">
                  <Select defaultValue={selectedStrike} value={selectedStrike} onChange={(e) => {
                    updateSelectedStrike(e)
                  }} allowClear onClear={(e) => {
                    updateSelectedStrike("")
                  }} showSearch filterOption={filterOption} options={
                    Array.from(new Set(filteredInstruments.map((i) => getStrikeOptionTypeStr(i)))).map((s) => ({
                      value: s,
                      label: s,
                    }))
                  } />
                </Form.Item>
                <Form.Item label="Amount">
                  <InputNumber defaultValue={amount} value={amount} onChange={(e) => {
                    updateAmount(e)
                  }} style={{ width: '100%' }} />
                </Form.Item>
                <div style={{
                  display: 'flex',
                  gap: 2,
                }}>
                  <Button type='primary' block style={{
                    background: '#52c41a'
                  }} onClick={onFormBuy} disabled={!filteredInstruments || filteredInstruments.length != 1}>Buy</Button>
                  <Button type='primary' block style={{
                    background: '#fa541c'
                  }} onClick={onFormSell} disabled={!filteredInstruments || filteredInstruments.length != 1}>Sell</Button>
                </div>
              </Form>
            ) : (<Space style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', width: '100%', height: '100%' }}><Spin indicator={AntIcon} size="large" /> </Space>)
          }
        </>
      )
    }, {
      label: <div style={{ padding: '0 4px 0 4px' }}>Simulate price</div>,
      key: '2',
      children: <div>
        {
          Object.keys(indexPrices).sort().map((asset, i) => {
            return (
              <Row key={i}>
                <Col span={4}>
                  <Space style={{ padding: '6px 0 0 6px' }}>{asset}</Space>
                </Col>
                <Col span={20}>
                  <Slider
                    min={getPriceLimits(indexPrices[asset], 2)[0]}
                    max={getPriceLimits(indexPrices[asset], 2)[1]}
                    onChange={(val) => onSliderChange(asset, val)}
                    value={selectedIndexPrices[asset]}
                    step={getPriceStep(indexPrices[asset])}
                  />
                </Col>
                <Col span={4}>
                </Col>
                <Col span={20}>
                  <InputNumber
                    min={getPriceLimits(indexPrices[asset], 2)[0]}
                    max={getPriceLimits(indexPrices[asset], 2)[1]}
                    style={{ marginLeft: '4px' }}
                    value={selectedIndexPrices[asset]}
                    onChange={(val) => onSliderChange(asset, val)}
                  />
                </Col>
              </Row>
            )

          })
        }
        <Row>
          <Col span={24}>
            <div style={{ height: '24px', minHeight: '24px' }}></div>
          </Col>
        </Row>
        <Row style={{ padding: '4px 6px', borderTop: 'solid 1px #eee' }}>
          <Col span={8}>
            <div>PNL:<div style={{ fontSize: '12px' }}>({isCoinSettleCurrency ? 'COIN' : 'USD'})</div></div>
          </Col>
          <Col span={16}>
            {Object.keys(selectedIndexPrices).sort().map((asset, i) => {
              return <div key={i}>
                {asset}: {toFixed(getPositionsPnl(selectedIndexPrices[asset], 0.0, (new Date()).getTime(), positions.filter((p) => p.asset == asset), isCoinSettleCurrency), 5)}
              </div>
            })}
          </Col>
        </Row>
        <Row style={{ padding: '4px 6px', borderTop: 'solid 1px #eee' }}>
          <Col span={8} >
            <div >TotalPNL:<div style={{ fontSize: '12px' }}>({isCoinSettleCurrency ? 'BTC' : 'USD'})</div></div>
          </Col>
          <Col span={16}>
            <div>
              {toFixed(Object.keys(selectedIndexPrices).sort().reduce((acc, asset) => {
                if (isCoinSettleCurrency) {
                  if (asset == 'ETH') {
                    return acc + getPositionsPnl(selectedIndexPrices[asset], 0.0, (new Date()).getTime(), positions.filter((p) => p.asset == asset), isCoinSettleCurrency) * ethBTCPrice
                  } else {
                    return acc + getPositionsPnl(selectedIndexPrices[asset], 0.0, (new Date()).getTime(), positions.filter((p) => p.asset == asset), isCoinSettleCurrency)
                  }
                } else {
                  return acc + getPositionsPnl(selectedIndexPrices[asset], 0.0, (new Date()).getTime(), positions.filter((p) => p.asset == asset), isCoinSettleCurrency)
                }
              }, 0), 5)}
            </div>
          </Col>
        </Row>
        {/*{JSON.stringify(selectedIndexPrices)} */}
      </div>
    }
  ]

  return (
    <Tabs size="small" items={tabItems} style={{ border: '1px solid #eee', borderRadius: '4px' }} />
  )
}
export default PositionForm
