import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Tag, Row, Col, Statistic } from 'antd'
import { ArrowLeftOutlined, EditOutlined, ShopOutlined, DollarOutlined } from '@ant-design/icons'
import { getFranchise } from '../../services/franchiseService'
import { Franchise } from '../../types/franchise'
import { useAuth } from '../../context/AuthContext'

const FranchiseDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<Franchise | null>(null)
  const [loading, setLoading] = useState(true)
  const { hasRole } = useAuth()

  useEffect(() => {
    if (!id) return
    getFranchise(id)
      .then(setItem)
      .finally(() => setLoading(false))
  }, [id])

  const contractDaysRemaining = item?.contractEndDate 
    ? Math.ceil((new Date(item.contractEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={`Franchise: ${item?.franchiseName || item?.name || 'Loading...'}`}
        extra={
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
              Back
            </Button>
            {hasRole('Admin') && (
              <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/franchises/${id}/edit`)}>
                Edit
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
                  title="Franchise Fee" 
                  value={item.franchiseFee || 0} 
                  precision={2} 
                  prefix={<DollarOutlined />} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Royalty Rate" 
                  value={item.royaltyRate || 0} 
                  suffix="%" 
                  prefix={<ShopOutlined />} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Contract Days Remaining" 
                  value={contractDaysRemaining} 
                  suffix="days" 
                />
              </Col>
            </Row>

            <Descriptions column={2} bordered>
              <Descriptions.Item label="Franchise Name">{item.franchiseName || item.name}</Descriptions.Item>
              <Descriptions.Item label="Franchise Code">{item.franchiseCode}</Descriptions.Item>
              <Descriptions.Item label="Owner">{item.ownerName || item.ownerId}</Descriptions.Item>
              <Descriptions.Item label="Territory">{item.territory}</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {item.address}, {item.city}, {item.state} {item.postalCode}
              </Descriptions.Item>
              <Descriptions.Item label="Contract Start">
                {item.contractStartDate ? new Date(item.contractStartDate).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Contract End">
                {item.contractEndDate ? new Date(item.contractEndDate).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={item.status === 'Active' ? 'green' : 'red'}>{item.status || 'Active'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            {contractDaysRemaining < 90 && contractDaysRemaining > 0 && (
              <Card 
                size="small" 
                style={{ marginTop: 16, backgroundColor: '#fff2e8', borderColor: '#ffbb96' }}
              >
                <p style={{ margin: 0, color: '#d4380d' }}>
                  <strong>Contract Alert:</strong> This franchise contract expires in {contractDaysRemaining} days. 
                  Consider renewal discussions.
                </p>
              </Card>
            )}

            {contractDaysRemaining <= 0 && (
              <Card 
                size="small" 
                style={{ marginTop: 16, backgroundColor: '#fff1f0', borderColor: '#ffccc7' }}
              >
                <p style={{ margin: 0, color: '#cf1322' }}>
                  <strong>Contract Expired:</strong> This franchise contract has expired. 
                  Immediate action required.
                </p>
              </Card>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default FranchiseDetail
