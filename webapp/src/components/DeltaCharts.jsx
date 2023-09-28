import { useAtom } from 'jotai';
import { indexPricesAtom } from '../store/positionStore';
import { Col, Row } from 'antd';
import OptionDeltaChart from './OptionDeltaChart';


const DeltaCharts = () => {

  const [indexPrices] = useAtom(indexPricesAtom)

  return (
    <>
      <Row style={{ height: '100%', width: '100%' }}>
        {
          Object.keys(indexPrices).sort().map((a, i) => {
            return <Col span={12} key={i}><OptionDeltaChart asset={a} /></Col>
          })
        }
      </Row>
    </>
  )
}
export default DeltaCharts
