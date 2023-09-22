
import ReactEChart from 'echarts-for-react'
import { useAtom } from 'jotai';
import { indexPriceAtom, isCombinedPositionAtom, positionAssetAtom, positionAssetPriceAtom, positionRwAtom } from '../store/positionStore';
import { useEffect } from 'react';
import { generatePnlData, isCoinSettleCurrencydAtom, pnlChartOptonRwAtom, settleCurrencyRwAtom } from '../store/pnlChartStore';
import { Switch, Tooltip } from 'antd';


const OptionPnlChart = () => {

  const [isCombinedPosition] = useAtom(isCombinedPositionAtom)
  const [assetPrice] = useAtom(positionAssetPriceAtom)
  const [positions] = useAtom(positionRwAtom)
  const [pnlChartOption, updatePnlChartOption] = useAtom(pnlChartOptonRwAtom)

  const [settleCurrency, updateSettleCurreny] = useAtom(settleCurrencyRwAtom)
  const [isCoinSettleCurrency] = useAtom(isCoinSettleCurrencydAtom)

  useEffect(() => {
    updatePnlChartOption(
      isCombinedPosition ? [] : generatePnlData(assetPrice, positions, isCoinSettleCurrency),
      Array.from(new Set(positions.map((p) => p.strike))),
    )
  }, [assetPrice, positions, isCoinSettleCurrency, isCombinedPosition, updatePnlChartOption])

  const onSwitchChange = (e) => {
    if (e) {
      updateSettleCurreny("COIN")
    } else {
      updateSettleCurreny("USD")
    }
  }

  return (
    <>
      <Tooltip title='settlement currency'>
        <Switch checkedChildren="COIN" unCheckedChildren="USD" defaultChecked={false} onChange={onSwitchChange} />
      </Tooltip>
      {
        assetPrice != '' ? (
          <ReactEChart option={pnlChartOption} style={{ height: '100%' }} />
        ) : (
          <ReactEChart option={pnlChartOption} style={{ height: '100%' }} />
        )
      }
    </>
  )
}
export default OptionPnlChart
