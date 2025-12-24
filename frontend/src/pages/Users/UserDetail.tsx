import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Tag, Avatar } from 'antd'
import { ArrowLeftOutlined, EditOutlined, UserOutlined } from '@ant-design/icons'
import { getUser } from '../../services/userService'
import { User } from '../../types/user'
import { useAuth } from '../../context/AuthContext'

const UserDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { hasRole } = useAuth()

  useEffect(() => {
    if (!id) return
    getUser(id)
      .then(setItem)
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar size={48} icon={<UserOutlined />} />
            <div>
              <div>{item ? `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.name || item.email : 'Loading...'}</div>
              <div style={{ fontSize: 14, color: '#666' }}>{item?.email}</div>
            </div>
          </div>
        }
        extra={
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
              Back
            </Button>
            {hasRole('Admin') && (
              <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/users/${id}/edit`)}>
                Edit
              </Button>
            )}
          </div>
        }
        loading={loading}
      >
        {item && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="First Name">{item.firstName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{item.lastName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Email">{item.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{item.phone || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag color={item.role === 'Admin' ? 'red' : item.role === 'Dealer' ? 'blue' : 'default'}>
                {item.role}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={item.isActive !== false ? 'green' : 'red'}>
                {item.isActive !== false ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  )
}

export default UserDetail
