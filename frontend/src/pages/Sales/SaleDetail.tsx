import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Table, Tag, Row, Col, Statistic } from 'antd'
import { ArrowLeftOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons'
import { getSale } from '../../services/saleService'
import { Sale } from '../../types/sale'

const SaleDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getSale(id)
      .then(setItem)
      .finally(() => setLoading(false))
  }, [id])

  const itemColumns = [
    { title: 'Product', dataIndex: 'productName', key: 'productName' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', render: (val: number) => `$${val?.toFixed(2)}` },
    { title: 'Line Total', dataIndex: 'lineTotal', key: 'lineTotal', render: (val: number) => `$${val?.toFixed(2)}` }
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={`Sale: ${item?.saleNumber || 'Loading...'}`}
        extra={
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
              Back
            </Button>
            {item?.invoiceId && (
              <Button icon={<FileTextOutlined />} onClick={() => navigate(`/invoices/${item.invoiceId}`)}>
                View Invoice
              </Button>
            )}
          </div>
        }
        loading={loading}
      >
        {item && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Statistic 
                  title="Subtotal" 
                  value={item.subtotal || 0} 
                  precision={2} 
                  prefix={<DollarOutlined />} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Tax Amount" 
                  value={item.taxAmount || 0} 
                  precision={2} 
                  prefix={<DollarOutlined />} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Total Amount" 
                  value={item.totalAmount || item.total || 0} 
                  precision={2} 
                  prefix={<DollarOutlined />} 
                />
              </Col>
            </Row>

            <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Sale Number">{item.saleNumber}</Descriptions.Item>
              <Descriptions.Item label="Sale Date">
                {item.saleDate ? new Date(item.saleDate).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Dealer">{item.dealerName || item.dealerId}</Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={item.paymentStatus === 'Paid' ? 'green' : 'orange'}>
                  {item.paymentStatus || 'Pending'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Customer Name">{item.customerName || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Customer Email">{item.customerEmail || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Customer Phone">{item.customerPhone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Payment Method">{item.paymentMethod || 'N/A'}</Descriptions.Item>
              {item.discountAmount > 0 && (
                <Descriptions.Item label="Discount">${item.discountAmount?.toFixed(2)}</Descriptions.Item>
              )}
              {item.notes && (
                <Descriptions.Item label="Notes" span={2}>{item.notes}</Descriptions.Item>
              )}
            </Descriptions>

            <Card title="Sale Items" size="small">
              <Table 
                dataSource={item.items || []} 
                columns={itemColumns}
                rowKey={(record: any, index?: number) => record?.productId || `item-${index || 0}`}
                pagination={false}
                size="small"
                summary={(pageData) => {
                  const total = pageData.reduce((sum, record) => sum + (record.lineTotal || 0), 0)
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>${total.toFixed(2)}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )
                }}
              />
            </Card>
          </>
        )}
      </Card>
    </div>
  )
}

export default SaleDetail
