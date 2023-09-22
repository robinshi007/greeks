import ReactEChart from 'echarts-for-react'
import { useAtom } from 'jotai';
import { indexPriceAtom, isCombinedPositionAtom, positionAssetAtom, positionAssetPriceAtom, positionRwAtom } from '../store/positionStore';
import { useEffect } from 'react';
import { deltaChartOptonRwAtom, generateDeltaData } from '../store/deltaChartStore';


const OptionDeltaChart = () => {

  const [isCombinedPosition] = useAtom(isCombinedPositionAtom)
  const [asset] = useAtom(positionAssetAtom)
  const [assetPrice] = useAtom(positionAssetPriceAtom)
  const [positions] = useAtom(positionRwAtom)
  const [deltaChartOption, updateDeltaChartOption] = useAtom(deltaChartOptonRwAtom)

  useEffect(() => {
    updateDeltaChartOption(isCombinedPosition ? [] : generateDeltaData(assetPrice, positions))
  }, [positions, assetPrice, isCombinedPosition, updateDeltaChartOption])

  return (
    <>
      {
        assetPrice != '' ? (
          <ReactEChart option={deltaChartOption} style={{ height: '100%' }} />
        ) : (
          <ReactEChart option={deltaChartOption} style={{ height: '100%' }} />
        )
      }
    </>
  )
}
export default OptionDeltaChart
