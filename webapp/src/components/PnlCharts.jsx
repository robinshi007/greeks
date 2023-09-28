import { useAtom } from 'jotai';
import { indexPricesAtom } from '../store/positionStore';
import { settleCurrencyRwAtom } from '../store/pnlChartStore';
import { Row, Col, Switch, Tooltip } from 'antd';
import OptionPnlChart from './OptionPnlChart';


const PnlCharts = () => {

  const [indexPrices] = useAtom(indexPricesAtom)

  const [settleCurrency, updateSettleCurreny] = useAtom(settleCurrencyRwAtom)

  const onSwitchChange = (e) => {
    if (e) {
      updateSettleCurreny("COIN")
    } else {
      updateSettleCurreny("USD")
    }
  }

  return (
    <>
      <Tooltip title='Settlement currency'>
        <Switch checkedChildren="COIN" unCheckedChildren="USD" defaultChecked={false} onChange={onSwitchChange} />
      </Tooltip>

      <Row style={{ height: '100%', width: '100%' }}>
        {
          Object.keys(indexPrices).sort().map((a, i) => {
            return <Col span={12} key={i}><OptionPnlChart asset={a} /></Col>
          })
        }
      </Row>
    </>
  )
}
export default PnlCharts
