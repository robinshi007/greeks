import ReactEChart from 'echarts-for-react'
import { useAtom } from 'jotai';
import { indexPricesAtom, positionRwAtom } from '../store/positionStore';
import { useEffect, useRef } from 'react';
import { deltaChartOptonRwAtom, generateDeltaData } from '../store/deltaChartStore';


const OptionDeltaChart = ({ asset }) => {
  const ref = useRef(null)
  const [indexPrices] = useAtom(indexPricesAtom)
  const [positions] = useAtom(positionRwAtom)
  const [deltaChartOption, updateDeltaChartOption] = useAtom(deltaChartOptonRwAtom)

  useEffect(() => {
    console.log('ref', ref)
    if (ref.current) {
      updateDeltaChartOption(
        asset,
        generateDeltaData(
          indexPrices[asset],
          positions.filter((p) => p.asset == asset)
        ),
        indexPrices[asset],
        ref.current.getEchartsInstance().getOption(),
      )
    }
  }, [asset, positions, indexPrices, updateDeltaChartOption])

  return (
    <>
      <ReactEChart option={deltaChartOption[asset]} notMerge={true} lazyUpdate={true} ref={ref} style={{ height: '400px' }} />
    </>
  )
}
export default OptionDeltaChart
