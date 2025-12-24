import React, { useEffect, useState } from 'react'
import { Table, Button, Card, Space, Tag } from 'antd'
import { ShopOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { getFranchises } from '../../services/franchiseService'
import { Franchise } from '../../types/franchise'

const FranchiseList: React.FC = () => {
  const [items, setItems] = useState<Franchise[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getFranchises()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { title: 'Franchise Name', dataIndex: 'franchiseName', key: 'franchiseName', render: (val: string, rec: any) => val || rec.name },
    { title: 'Code', dataIndex: 'franchiseCode', key: 'franchiseCode' },
    { title: 'Territory', dataIndex: 'territory', key: 'territory' },
    { title: 'Owner', dataIndex: 'ownerName', key: 'ownerName' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => {
      const color = status === 'Active' ? 'green' : status === 'Inactive' ? 'red' : 'orange'
      return <Tag color={color}>{status}</Tag>
    }},
    { title: 'Contract End', dataIndex: 'contractEndDate', key: 'contractEndDate', render: (val: string) => val ? new Date(val).toLocaleDateString() : '' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Franchise) => (
        <Space>
          <Link to={`/franchises/${record.id}`}>
            <Button type="link" icon={<ShopOutlined />}>View</Button>
          </Link>
        </Space>
      ),
    },
  ]

  const activeCount = items.filter(f => f.status === 'Active').length

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Card size="small">
          <div>Total: <strong>{items.length}</strong></div>
        </Card>
        <Card size="small">
          <div>Active: <strong>{activeCount}</strong></div>
        </Card>
      </div>
      
      <Card title="Franchises" extra={<Button type="primary"><Link to="/franchises/new">New Franchise</Link></Button>}>
        <Table rowKey="id" dataSource={items} columns={columns} loading={loading} />
      </Card>
    </div>
  )
}

export default FranchiseList
