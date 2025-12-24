import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Tag } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { getUsers } from '../../services/userService'
import { User } from '../../types/user'

const UsersList: React.FC = () => {
  const [items, setItems] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getUsers().then(setItems).finally(() => setLoading(false))
  }, [])

  const columns = [
    { title: 'Name', key: 'name', render: (_: any, rec: any) => `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role: string) => {
      const color = role === 'Admin' ? 'red' : role === 'Dealer' ? 'blue' : 'default'
      return <Tag color={color}>{role}</Tag>
    }},
    { title: 'Status', dataIndex: 'isActive', key: 'isActive', render: (active: boolean) => (
      <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
    )},
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => val ? new Date(val).toLocaleDateString() : '' },
    { title: 'Actions', key: 'actions', render: (_: any, rec: User) => (
      <Space>
        <Link to={`/users/${rec.id}`}><Button type="link" icon={<UserOutlined />}>View</Button></Link>
      </Space>
    )}
  ]

  const adminCount = items.filter(u => u.role === 'Admin').length
  const activeCount = items.filter(u => u.isActive).length

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Card size="small">
          <div>Total: <strong>{items.length}</strong></div>
        </Card>
        <Card size="small">
          <div>Active: <strong>{activeCount}</strong></div>
        </Card>
        <Card size="small">
          <div>Admins: <strong>{adminCount}</strong></div>
        </Card>
      </div>
      
      <Card title="Users" extra={<Button type="primary"><Link to="/users/new">New User</Link></Button>}>
        <Table rowKey="id" dataSource={items} columns={columns} loading={loading} />
      </Card>
    </div>
  )
}

export default UsersList
