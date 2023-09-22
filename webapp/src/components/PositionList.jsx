import { Card, Table, Button, Tooltip, Popconfirm } from "antd"
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { positionWAtom, positionRwAtom, refreshPositionAtom, positionNeedUpdateAtom } from "../store/positionStore"
import { useAtom } from "jotai"
import { useEffect, useRef } from "react";


const PositionList = () => {
  const timer = useRef(null)
  const [positions] = useAtom(positionRwAtom)
  const [, resetPositions] = useAtom(positionWAtom)
  const [, refreshPositions] = useAtom(refreshPositionAtom)
  const [positionNeedUpdate] = useAtom(positionNeedUpdateAtom)

  const handleDelete = (key) => {
    const newPositions = positions.filter((item) => item.key !== key);
    resetPositions(newPositions);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: 'instrument_name',
      key: 'instrument_name',
    },
    {
      title: "Side",
      dataIndex: 'side',
      key: 'side',
      render: (text) => text == 'buy' ?
        (<div style={{ color: 'green' }}>{text}</div>) :
        (<div style={{ color: 'red' }}>{text}</div>)
    },
    {
      title: "Amount",
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: "Expiration",
      dataIndex: 'expiration_str',
      key: 'expiration_str',
    },
    {
      title: "Mark price",
      dataIndex: 'mark_price',
      key: 'mark_price',
      render: (text) => text ? text.toFixed(4) : '',
    },
    {
      title: "Mark price/P",
      dataIndex: 'mark_price_c',
      key: 'mark_price_c',
      render: (text) => text ? text.toFixed(4) : '',
    },
    {
      title: "IV(%)",
      dataIndex: 'iv_percent',
      key: 'iv_percent',
      render: (text) => text ? text.toFixed(2) : '',
    },
    {
      title: "Delta",
      dataIndex: 'delta',
      key: 'delta',
      render: (text) => text ? text.toFixed(5) : '',
    },
    {
      title: "Gamma",
      dataIndex: 'gamma',
      key: 'gamma',
      render: (text) => text ? text.toFixed(5) : '',
    },
    {
      title: "Theta/day",
      dataIndex: 'theta_per_day',
      key: 'theta_per_day',
      render: (text) => text ? text.toFixed(4) : '',
    },
    {
      title: "Vega",
      dataIndex: 'vega_percent',
      key: 'vega_percent',
      render: (text) => text ? text.toFixed(4) : '',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) =>
      (<Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
        <Button type='text' icon={<DeleteOutlined />} />
      </Popconfirm>)
    }
  ]

  useEffect(() => {
    timer.current = setInterval(() => {
      if (positionNeedUpdate) {
        refreshPositions()
      }
    }, 3000)
    return () => {
      clearInterval(timer.current)
    }
  }, [positionNeedUpdate, refreshPositions])

  console.log('---', positions)

  return (
    <>
      <Card title="Positions" size='small' bordered={false} extra={<Tooltip title='fetch mark price and iv from deribit'><Button icon={<ReloadOutlined />} onClick={() => refreshPositions()} /></Tooltip>}>
        <Table columns={columns} dataSource={positions} size="small" />
      </Card>
    </>
  )
}
export default PositionList
