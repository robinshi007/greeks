import ReactEChart from 'echarts-for-react'
import { useAtom } from 'jotai';
import { indexPricesAtom, positionAssetsAtom, positionRwAtom, selectedIndexPricesAtom } from '../store/positionStore';
import { useEffect, useRef } from 'react';
import { generatePnlData, isCoinSettleCurrencyAtom, pnlChartOptionRwAtom, settleCurrencyRwAtom } from '../store/pnlChartStore';


const OptionPnlChart = ({ asset }) => {
  const ref = useRef(null)
  const [indexPrices] = useAtom(indexPricesAtom)
  const [selectedIndexPrices] = useAtom(selectedIndexPricesAtom)
  const [positions] = useAtom(positionRwAtom)
  const [pnlChartOption, updatePnlChartOption] = useAtom(pnlChartOptionRwAtom)

  const [isCoinSettleCurrency] = useAtom(isCoinSettleCurrencyAtom)

  useEffect(() => {
    if (ref.current) {
      updatePnlChartOption(
        asset,
        generatePnlData(indexPrices[asset], positions.filter((p) => p.asset == asset), isCoinSettleCurrency),
        Array.from(new Set(positions.filter((p) => p.asset == asset).map((p) => p.strike).filter((s) => s && s > 0))),
        selectedIndexPrices[asset],
        ref.current.getEchartsInstance().getOption(),
      )
    }
  }, [asset, indexPrices, selectedIndexPrices, positions, isCoinSettleCurrency, updatePnlChartOption])

  return (
    <>
      <ReactEChart option={pnlChartOption[asset]} notMerge={true} lazyUpdate={true} style={{ height: '380px' }} ref={ref} />
    </>
  )
}
export default OptionPnlChart
