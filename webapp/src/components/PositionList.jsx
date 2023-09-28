import { Card, Table, Button, Tooltip, Popconfirm, Form, Typography, Input, InputNumber } from "antd"
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { positionWAtom, positionRwAtom, refreshPositionAtom, positionNeedUpdateAtom, positionCountAtom } from "../store/positionStore"
import { useAtom } from "jotai"
import { useEffect, useRef, useState } from "react";
import { isCoinSettleCurrencyAtom } from "../store/pnlChartStore";

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const PositionList = () => {
  // const timer = useRef(null)
  const [positions, updatePositions] = useAtom(positionRwAtom)
  const [, resetPositions] = useAtom(positionWAtom)
  const [, refreshPositions] = useAtom(refreshPositionAtom)
  const [positionCount] = useAtom(positionCountAtom)

  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState('')

  const isEditing = (record) => record.key == editingKey
  const edit = (record) => {
    form.setFieldsValue({
      ...record,
    })
    setEditingKey(record.key)
  }
  const cancelEdit = () => {
    setEditingKey('')
  }
  const save = async (key) => {
    try {
      const row = await form.validateFields()
      const position = positions.filter((p) => p.key == key)
      // console.log('row', row, key)
      if (position.length == 1) {
        updatePositions({ ...position[0], ...row })
      } else {
        console.log(`cannot find position with key ${key}`)
      }
      setEditingKey('')
    } catch (err) {
      setEditingKey('')
      console.eror(err)
    }
  }

  const handleDelete = (key) => {
    const newPositions = positions.filter((item) => item.key !== key);
    resetPositions(newPositions);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: 'instrument_name',
      key: 'instrument_name',
      editable: false,
    },
    {
      title: "Side",
      dataIndex: 'side',
      key: 'side',
      editable: false,
      render: (text) => text == 'buy' ?
        (<div style={{ color: 'green' }}>{text}</div>) :
        (<div style={{ color: 'red' }}>{text}</div>)
    },
    {
      title: "Amount",
      dataIndex: 'amount',
      key: 'amount',
      editable: true,
    },
    {
      title: "Cost(COIN)",
      dataIndex: 'cost',
      key: 'cost',
      editable: true,
    },
    {
      title: "Expiration",
      dataIndex: 'expiration_str',
      key: 'expiration_str',
      editable: false,
    },
    {
      title: "Mark price(USD)",
      dataIndex: 'mark_price',
      key: 'mark_price',
      editable: false,
      render: (text) => text ? text.toFixed(4) : '',
    },
    {
      title: "Mark price(COIN)",
      dataIndex: 'mark_price_c',
      key: 'mark_price_c',
      editable: false,
      render: (text) => text ? text.toFixed(4) : '',
    },
    {
      title: "IV(%)",
      dataIndex: 'iv_percent',
      key: 'iv_percent',
      editable: false,
      render: (text) => text ? text.toFixed(2) : '',
    },
    {
      title: "Delta",
      dataIndex: 'delta',
      key: 'delta',
      editable: false,
      render: (text) => text ? text.toFixed(5) : '',
    },
    {
      title: "Gamma",
      dataIndex: 'gamma',
      key: 'gamma',
      editable: false,
      render: (text) => text ? text.toFixed(5) : '',
    },
    {
      title: "Theta/day",
      dataIndex: 'theta_per_day',
      key: 'theta_per_day',
      editable: false,
      render: (text) => text ? text.toFixed(4) : '',
    },
    {
      title: "Vega",
      dataIndex: 'vega_percent',
      key: 'vega_percent',
      editable: false,
      render: (text) => text ? text.toFixed(4) : '',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => {
        const editable = isEditing(record)
        return (<>
          {
            editable ? (
              <span>
                <Tooltip title='save'>
                  <Typography.Link onClick={() => save(record.key)} style={{ marginRight: '6px' }}>Save</Typography.Link>
                </Tooltip>
                <Popconfirm title="Sure to cancel?" onConfirm={cancelEdit}>
                  <Tooltip title='cancel editing'><a style={{ marginRight: '6px' }}>Cancel</a></Tooltip>
                </Popconfirm>
              </span>
            ) : (
              <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>Edit</Typography.Link>
            )
          }

          <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
            <Tooltip title="delete"><Button type='text' icon={<DeleteOutlined />} /></Tooltip>
          </Popconfirm>
        </>)
      }
    }
  ]

  // useEffect(() => {
  //   timer.current = setInterval(() => {
  //     if (positionNeedUpdate) {
  //       refreshPositions()
  //     }
  //   }, 3000)
  //   return () => {
  //     clearInterval(timer.current)
  //   }
  // }, [positionNeedUpdate, refreshPositions])

  useEffect(() => {
    refreshPositions()
  }, [positionCount])

  console.log('---', positions)

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: ['amount', 'cost'].includes(col.dataIndex) ? 'number' : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    }
  })

  return (
    <>
      <Card title="Positions" size='small' bordered={false} extra={<Tooltip title='Update index/mark prices'><Button icon={<ReloadOutlined />} onClick={() => refreshPositions()} /></Tooltip>}>
        <Form form={form} component={false}>
          <Table components={{
            body: {
              cell: EditableCell,
            },
          }} columns={mergedColumns} dataSource={positions} size="small"
            rowClassName='editable-row'
          />
        </Form>
      </Card>
    </>
  )
}
export default PositionList
