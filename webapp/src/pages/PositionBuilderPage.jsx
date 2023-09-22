import { useAtom } from "jotai"
import { Button, Card, Col, Form, InputNumber, Row, Select, Spin, Tabs } from "antd"
import PositionList from "../components/PositionList"
import { indexPriceAtom, isCombinedPositionAtom, positionRwAtom } from "../store/positionStore"
import OptionPnlChart from "../components/OptionPnlChart"
import OptionDeltaChart from "../components/OptionDeltaChart"
import PositionForm from "../components/PositionForm"
import { settleCurrencyRwAtom } from "../store/pnlChartStore"

const PositionBuilderPage = () => {
  const [indexPrices] = useAtom(indexPriceAtom)
  const [isCombinedPosition] = useAtom(isCombinedPositionAtom)
  const [settleCurrency] = useAtom(settleCurrencyRwAtom)

  const tabItems = [
    {
      key: '1',
      label: 'Pnl view',
      children: <OptionPnlChart />,
    },
    {
      key: '2',
      label: 'Delta view',
      children: <OptionDeltaChart />,
    },
  ];
  const onTabChange = (key) => {
    console.log(key);
  };
  return (<>
    <div>
      <Row style={{ minHeight: '460px' }}>
        <div className="flex" style={{
          display: 'flex',
          gap: 2,
          width: '100%'
        }}>
          <div className="side" style={{
            width: '300px',
            marginRight: '12px'
          }}>
            <PositionForm />
          </div>
          <div className="main" style={{
            width: '100%'
          }}>
            <Tabs defaultActiveKey="1" size="small" items={tabItems} onChange={onTabChange} />
          </div>
        </div>
      </Row>
      <Row>
        <Col span={24}>
          <PositionList />
        </Col>
        {/*<Col>
          <div>{JSON.stringify(indexPrices)} {JSON.stringify(isCombinedPosition)}</div>
          <div>{JSON.stringify(settleCurrency)}</div>
        </Col>
*/}
      </Row>
      {/* debug here */}
      {/*<div>{selectedAsset}{selectedExpireStr}{selectedStrike} </div> */}
      {/*<div>{filteredInstruments && filteredInstruments.length == 1 ? filteredInstruments[0].instrument_name : ''} </div> */}
    </div >
  </>)
}
export default PositionBuilderPage
