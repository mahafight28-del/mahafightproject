import React, { useEffect, useState } from 'react'
import { Card, Typography, Row, Col, Statistic, Table, Spin } from 'antd'
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
      <div style={{ padding: 24 }}>
        <Card>
          <Title level={3}>Dashboard</Title>
          <p>Unable to load dashboard data.</p>
        </Card>
      </div>
    )
  }

  const salesGrowth = stats.lastMonthSales > 0 
    ? ((stats.thisMonthSales - stats.lastMonthSales) / stats.lastMonthSales * 100).toFixed(1)
    : '0'

  const recentSalesColumns = [
    { title: 'Sale #', dataIndex: 'saleNumber', key: 'saleNumber' },
    { title: 'Dealer', dataIndex: 'dealerName', key: 'dealerName' },
    { title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount', render: (val: number) => `$${val.toFixed(2)}` },
    { title: 'Date', dataIndex: 'saleDate', key: 'saleDate', render: (val: string) => new Date(val).toLocaleDateString() }
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              suffix={`(${stats.activeUsers} active)`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Dealers"
              value={stats.totalDealers}
              prefix={<UserOutlined />}
              suffix={`(${stats.activeDealers} active)`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Products"
              value={stats.totalProducts}
              prefix={<ShoppingOutlined />}
              suffix={stats.lowStockProducts > 0 ? `(${stats.lowStockProducts} low stock)` : ''}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="This Month Sales"
              value={stats.thisMonthSales}
              prefix={<DollarOutlined />}
              precision={2}
              suffix={`(${salesGrowth}%)`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="Pending Commissions"
              value={stats.pendingCommissions}
              prefix={<AlertOutlined />}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Sales Comparison">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="This Month" value={stats.thisMonthSales} precision={2} />
              </Col>
              <Col span={12}>
                <Statistic title="Last Month" value={stats.lastMonthSales} precision={2} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Dealer Status">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Active" value={stats.activeDealers} />
              </Col>
              <Col span={12}>
                <Statistic title="Total" value={stats.totalDealers} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card title="Recent Sales" style={{ marginTop: 24 }}>
        <Table
          dataSource={stats.recentSales}
          columns={recentSalesColumns}
          pagination={false}
          size="small"
          rowKey="id"
        />
      </Card>
    </div>
  )
}

export default Dashboard
