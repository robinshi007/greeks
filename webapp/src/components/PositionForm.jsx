
import { useAtom } from "jotai"
import { Button, Card, Form, InputNumber, Select, Space, Spin } from "antd"
import { useEffect, useState } from "react"
import AntIcon from "../components/AntIcon"
import { filteredInstrumentsAtom, instrumentsAtom, selectedRWAsset, selectedRWExpireStr, selectedRWStrike } from "../store/instrumentStore"
import { getStrikeOptionTypeStr } from "../utils/greeks"
import { positionRwAtom } from "../store/positionStore"

const PositionForm = () => {
  const [instruments, updateInstruments] = useAtom(instrumentsAtom)

  const [selectedAsset, updateSelectedAsset] = useAtom(selectedRWAsset)
  const [selectedExpireStr, updateSelectedExpireStr] = useAtom(selectedRWExpireStr)
  const [selectedStrike, updateSelectedStrike] = useAtom(selectedRWStrike)
  const [amount, updateAmount] = useState(0)

  const [filteredInstruments] = useAtom(filteredInstrumentsAtom)
  const [positions, updatePositions] = useAtom(positionRwAtom)

  useEffect(() => {
    updateInstruments()
  }, [])

  const onFormBuy = (e) => {
    if (filteredInstruments && filteredInstruments.length == 1) {
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
    if (filteredInstruments && filteredInstruments.length == 1) {
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

  return (<>
    <Card title="Create simulated position" size='small' bordered={false} style={{
      borderRadius: '0'
    }}>

      {
        filteredInstruments.length != 0 ? (
          <Form layout="vertical">
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
        ) : (<Space align="center" style={{ 'width': '100%', height: '100%' }}><Spin indicator={AntIcon} /> </Space>)
      }
    </Card>
  </>)
}
export default PositionForm
