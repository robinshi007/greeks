import { useAtom } from "jotai"
import { Button, Card, Col, Form, InputNumber, Row, Select, Spin, Tabs } from "antd"
import PositionList from "../components/PositionList"
import { ethBTCPriceRwAtom, indexPricesAtom, positionAssetsAtom, positionRwAtom } from "../store/positionStore"
// import OptionDeltaChart from "../components/OptionDeltaChart"
import PositionForm from "../components/PositionForm"
import { isCoinSettleCurrencyAtom, settleCurrencyRwAtom } from "../store/pnlChartStore"
import PnlCharts from "../components/PnlCharts"
import DeltaCharts from "../components/DeltaCharts"

const PositionBuilderPage = () => {
  const [indexPrices] = useAtom(indexPricesAtom)
  const [isCoinSettleCurrency] = useAtom(isCoinSettleCurrencyAtom)
  const [ethBTCPrice] = useAtom(ethBTCPriceRwAtom)

  const tabItems = [
    {
      key: '1',
      label: 'PNL view',
      children: <PnlCharts />,
    },
    {
      key: '2',
      label: 'Delta view',
      children: <DeltaCharts />,
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
            marginRight: '12px',
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
        {/* <Col>
          <div>{JSON.stringify(indexPrices)} {JSON.stringify(isCoinSettleCurrency)}</div>
          <div>{ethBTCPrice} </div>
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
