import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Tag, message, Popconfirm } from 'antd'
import { DollarOutlined, CheckOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { getCommissions, markCommissionPaid } from '../../services/commissionService'
import { Commission } from '../../types/commission'

const CommissionsList: React.FC = () => {
  const [items, setItems] = useState<Commission[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getCommissions()
      setItems(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleMarkPaid = async (id: string) => {
    try {
      await markCommissionPaid(id)
      message.success('Commission marked as paid')
      load()
    } catch {
      message.error('Failed to mark as paid')
    }
  }

  const columns = [
    { title: 'Dealer', dataIndex: 'dealerName', key: 'dealerName' },
    { title: 'Sale Amount', dataIndex: 'saleAmount', key: 'saleAmount', render: (val: number) => val ? `$${val.toFixed(2)}` : '' },
    { title: 'Rate', dataIndex: 'commissionRate', key: 'commissionRate', render: (val: number) => val ? `${val}%` : '' },
    { title: 'Commission', dataIndex: 'commissionAmount', key: 'commissionAmount', render: (val: number) => val ? `$${val.toFixed(2)}` : '' },
    { title: 'Status', dataIndex: 'paymentStatus', key: 'paymentStatus', render: (status: string) => {
      const color = status === 'Paid' ? 'green' : 'orange'
      return <Tag color={color}>{status}</Tag>
    }},
    { title: 'Date', dataIndex: 'commissionDate', key: 'commissionDate', render: (val: string) => val ? new Date(val).toLocaleDateString() : '' },
    { title: 'Actions', key: 'actions', render: (_: any, rec: Commission) => (
      <Space>
        <Link to={`/commissions/${rec.id}`}><Button type="link" icon={<DollarOutlined />}>View</Button></Link>
        {rec.paymentStatus === 'Pending' && (
          <Popconfirm 
            title="Mark this commission as paid?"
            onConfirm={() => handleMarkPaid(rec.id)}
          >
            <Button type="primary" size="small" icon={<CheckOutlined />}>Mark Paid</Button>
          </Popconfirm>
        )}
      </Space>
    )}
  ]

  const totalPending = items.filter(c => c.paymentStatus === 'Pending').reduce((sum, c) => sum + (c.commissionAmount || 0), 0)
  const totalPaid = items.filter(c => c.paymentStatus === 'Paid').reduce((sum, c) => sum + (c.commissionAmount || 0), 0)

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Card size="small">
          <div>Pending: <strong>${totalPending.toFixed(2)}</strong></div>
        </Card>
        <Card size="small">
          <div>Paid: <strong>${totalPaid.toFixed(2)}</strong></div>
        </Card>
      </div>
      
      <Card title="Commissions">
        <Table rowKey="id" dataSource={items} columns={columns} loading={loading} />
      </Card>
    </div>
  )
}

export default CommissionsList
