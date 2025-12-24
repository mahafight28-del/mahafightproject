import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Table, Tag, Row, Col, Statistic, message } from 'antd'
import { ArrowLeftOutlined, DownloadOutlined, DollarOutlined } from '@ant-design/icons'
import { getInvoice, downloadInvoicePdf } from '../../services/invoiceService'
import { Invoice } from '../../types/invoice'

const InvoiceDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!id) return
    getInvoice(id)
      .then(setItem)
      .finally(() => setLoading(false))
  }, [id])

  const handleDownloadPdf = async () => {
    if (!id || !item) return
    setDownloading(true)
    try {
      const response = await downloadInvoicePdf(id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice_${item.invoiceNumber || id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      message.success('Invoice downloaded successfully')
    } catch {
      message.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  const itemColumns = [
    { title: 'Product', dataIndex: 'productName', key: 'productName' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', render: (val: number) => `$${val?.toFixed(2)}` },
    { title: 'Line Total', dataIndex: 'lineTotal', key: 'lineTotal', render: (val: number) => `$${val?.toFixed(2)}` }
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={`Invoice: ${item?.invoiceNumber || 'Loading...'}`}
        extra={
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
              Back
            </Button>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadPdf}
              loading={downloading}
            >
              Download PDF
            </Button>
          </div>
        }
        loading={loading}
      >
        {item && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Statistic 
                  title="Total Amount" 
                  value={item.totalAmount || item.total || 0} 
                  precision={2} 
                  prefix={<DollarOutlined />} 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Paid Amount" 
                  value={item.paidAmount || 0} 
                  precision={2} 
                  prefix={<DollarOutlined />} 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Balance" 
                  value={item.balanceAmount || (item.totalAmount - (item.paidAmount || 0)) || 0} 
                  precision={2} 
                  prefix={<DollarOutlined />} 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Tax Amount" 
                  value={item.taxAmount || 0} 
                  precision={2} 
                  prefix={<DollarOutlined />} 
                />
              </Col>
            </Row>

            <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Invoice Number">{item.invoiceNumber || item.number}</Descriptions.Item>
              <Descriptions.Item label="Invoice Date">
                {item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Due Date">
                {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={item.status === 'Paid' ? 'green' : item.status === 'Overdue' ? 'red' : 'orange'}>
                  {item.status || 'Pending'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Dealer">{item.dealerName || item.dealerId}</Descriptions.Item>
              <Descriptions.Item label="Payment Terms">{item.paymentTerms || 'N/A'}</Descriptions.Item>
              {item.notes && (
                <Descriptions.Item label="Notes" span={2}>{item.notes}</Descriptions.Item>
              )}
            </Descriptions>

            <Card title="Invoice Items" size="small">
              <Table 
                dataSource={item.items || []} 
                columns={itemColumns}
                rowKey={(record: any, index?: number) => record?.productId || `item-${index || 0}`}
                pagination={false}
                size="small"
                summary={(pageData) => {
                  const subtotal = pageData.reduce((sum, record) => sum + (record.lineTotal || 0), 0)
                  return (
                    <>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>
                          <strong>Subtotal</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong>${subtotal.toFixed(2)}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                      {item.taxAmount > 0 && (
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} colSpan={3}>
                            Tax
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1}>
                            ${item.taxAmount.toFixed(2)}
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      )}
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>
                          <strong>Total</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong>${(item.totalAmount || item.total || 0).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </>
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

export default InvoiceDetail
