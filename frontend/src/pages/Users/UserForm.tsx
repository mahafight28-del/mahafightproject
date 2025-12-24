import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Input, Button, Select, Switch, message } from 'antd'
import { createUser, getUser, updateUser } from '../../services/userService'
import { User } from '../../types/user'

const UserForm: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getUser(id).then((u: User) => form.setFieldsValue(u)).finally(() => setLoading(false))
  }, [id])

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      if (id) {
        // Add ID for update request
        const updateData = { ...values, id }
        await updateUser(id, updateData)
        message.success('User updated successfully')
      } else {
        await createUser(values)
        message.success('User created successfully')
      }
      navigate('/users')
    } catch {
      message.error('Save failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: 24 }}>
      <Card title={id ? 'Edit User' : 'New User'}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isActive: true, role: 'User' }}>
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          {!id && (
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Admin">Admin</Select.Option>
              <Select.Option value="User">User</Select.Option>
              <Select.Option value="Dealer">Dealer</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {id ? 'Update User' : 'Create User'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default UserForm
