import React, { useEffect, useState } from 'react'
import { Card, Typography, Row, Col, Statistic, Table, Spin, Empty } from 'antd'
import { UserOutlined, ShoppingOutlined, DollarOutlined, AlertOutlined } from '@ant-design/icons'
import api from '../../services/api'

const { Title } = Typography

type DashboardStats = {
  totalUsers: number
  activeUsers: number
  totalDealers: number
  activeDealers: number
  totalProducts: number
  lowStockProducts: number
  thisMonthSales: number
  lastMonthSales: number
  pendingCommissions: number
  recentSales: Array<{
    id: string
    saleNumber: string
    dealerName: string
    totalAmount: number
    saleDate: string
  }>
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/reports/dashboard-stats')
        setStats(res.data.data || res.data)
      } catch {
        console.error('Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div style={{ padding: 0 }}>
        <Card>
          <Empty 
            description="Unable to load dashboard data"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </div>
    )
  }

  const salesGrowth = stats.lastMonthSales > 0 
    ? ((stats.thisMonthSales - stats.lastMonthSales) / stats.lastMonthSales * 100).toFixed(1)
    : '0'

  const recentSalesColumns = [
    { 
      title: 'Sale #', 
      dataIndex: 'saleNumber', 
      key: 'saleNumber',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any
    },
    { 
      title: 'Dealer', 
      dataIndex: 'dealerName', 
      key: 'dealerName',
      responsive: ['sm', 'md', 'lg', 'xl'] as any
    },
    { 
      title: 'Amount', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount', 
      render: (val: number) => `$${val.toFixed(2)}`,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'] as any
    },
    { 
      title: 'Date', 
      dataIndex: 'saleDate', 
      key: 'saleDate', 
      render: (val: string) => new Date(val).toLocaleDateString(),
      responsive: ['md', 'lg', 'xl'] as any
    }
  ]

  return (
    <div style={{ padding: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
      </div>
      
      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card size="small">
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              suffix={<span style={{ fontSize: '12px', color: '#666' }}>({stats.activeUsers} active)</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card size="small">
            <Statistic
              title="Total Dealers"
              value={stats.totalDealers}
              prefix={<UserOutlined />}
              suffix={<span style={{ fontSize: '12px', color: '#666' }}>({stats.activeDealers} active)</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card size="small">
            <Statistic
              title="Products"
              value={stats.totalProducts}
              prefix={<ShoppingOutlined />}
              suffix={stats.lowStockProducts > 0 ? 
                <span style={{ fontSize: '12px', color: '#ff4d4f' }}>({stats.lowStockProducts} low)</span> : 
                undefined
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card size="small">
            <Statistic
              title="This Month Sales"
              value={stats.thisMonthSales}
              prefix={<DollarOutlined />}
              precision={2}
              suffix={<span style={{ fontSize: '12px', color: salesGrowth.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>({salesGrowth}%)</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card size="small" title="Pending Commissions">
            <Statistic
              value={stats.pendingCommissions}
              prefix={<AlertOutlined style={{ color: '#faad14' }} />}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card size="small" title="Sales Comparison">
            <Row gutter={8}>
              <Col span={12}>
                <Statistic title="This Month" value={stats.thisMonthSales} precision={2} size="small" />
              </Col>
              <Col span={12}>
                <Statistic title="Last Month" value={stats.lastMonthSales} precision={2} size="small" />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card size="small" title="Dealer Status">
            <Row gutter={8}>
              <Col span={12}>
                <Statistic title="Active" value={stats.activeDealers} size="small" />
              </Col>
              <Col span={12}>
                <Statistic title="Total" value={stats.totalDealers} size="small" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Recent Sales Table */}
      <Card title="Recent Sales" size="small">
        {stats.recentSales && stats.recentSales.length > 0 ? (
          <Table
            dataSource={stats.recentSales}
            columns={recentSalesColumns}
            pagination={false}
            size="small"
            rowKey="id"
            scroll={{ x: 600 }}
          />
        ) : (
          <Empty 
            description="No recent sales"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  )
}

export default Dashboard
