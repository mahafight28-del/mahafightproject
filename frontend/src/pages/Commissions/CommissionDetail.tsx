import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Tag, Row, Col, Statistic, Popconfirm, message } from 'antd'
import { ArrowLeftOutlined, DollarOutlined, CheckOutlined } from '@ant-design/icons'
import { getCommission, markCommissionPaid } from '../../services/commissionService'
import { Commission } from '../../types/commission'
import { useAuth } from '../../context/AuthContext'

const CommissionDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { hasRole } = useAuth()

  const loadCommission = async () => {
    if (!id) return
    try {
      const commission = await getCommission(id)
      setItem(commission)
    } catch {
      message.error('Failed to load commission details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCommission()
  }, [id])

  const handleMarkPaid = async () => {
    if (!id) return
    try {
      await markCommissionPaid(id)
      message.success('Commission marked as paid')
      loadCommission()
    } catch {
      message.error('Failed to mark as paid')
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={`Commission Details`}
        extra={
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
              Back
            </Button>
            {hasRole('Admin') && item?.paymentStatus === 'Pending' && (
              <Popconfirm 
                title="Mark this commission as paid?"
                onConfirm={handleMarkPaid}
              >
                <Button type="primary" icon={<CheckOutlined />}>
                  Mark as Paid
                </Button>
              </Popconfirm>
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
                  title="Sale Amount" 
                  value={item.saleAmount || 0} 
                  precision={2} 
                  prefix={<DollarOutlined />} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Commission Rate" 
                  value={item.commissionRate || item.rate || 0} 
                  suffix="%" 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Commission Amount" 
                  value={item.commissionAmount || item.amount || 0} 
                  precision={2} 
                  prefix={<DollarOutlined />} 
                />
              </Col>
            </Row>

            <Descriptions column={2} bordered>
              <Descriptions.Item label="Commission ID">{item.id}</Descriptions.Item>
              <Descriptions.Item label="Dealer">{item.dealerName || item.dealerId}</Descriptions.Item>
              <Descriptions.Item label="Sale ID">{item.saleId}</Descriptions.Item>
              <Descriptions.Item label="Invoice ID">{item.invoiceId || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Commission Date">
                {item.commissionDate ? new Date(item.commissionDate).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={item.paymentStatus === 'Paid' ? 'green' : 'orange'}>
                  {item.paymentStatus || item.status || 'Pending'}
                </Tag>
              </Descriptions.Item>
              {item.paidDate && (
                <Descriptions.Item label="Paid Date">
                  {new Date(item.paidDate).toLocaleDateString()}
                </Descriptions.Item>
              )}
              {item.paymentReference && (
                <Descriptions.Item label="Payment Reference">{item.paymentReference}</Descriptions.Item>
              )}
              {item.notes && (
                <Descriptions.Item label="Notes" span={2}>{item.notes}</Descriptions.Item>
              )}
              <Descriptions.Item label="Created">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            {item.paymentStatus === 'Paid' && (
              <Card 
                size="small" 
                style={{ marginTop: 16, backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}
              >
                <p style={{ margin: 0, color: '#52c41a' }}>
                  <strong>✓ Paid:</strong> This commission has been paid
                  {item.paidDate && ` on ${new Date(item.paidDate).toLocaleDateString()}`}.
                </p>
              </Card>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default CommissionDetail
