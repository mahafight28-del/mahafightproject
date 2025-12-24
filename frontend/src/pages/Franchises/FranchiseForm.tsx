import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Input, Button, DatePicker, InputNumber, Select, message } from 'antd'
import dayjs from 'dayjs'
import { createFranchise, getFranchise, updateFranchise } from '../../services/franchiseService'
import { getUsers } from '../../services/userService'
import { Franchise } from '../../types/franchise'

const FranchiseForm: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersData = await getUsers()
        setUsers(usersData || [])
        if (id) {
          setLoading(true)
          const franchise = await getFranchise(id)
          // Convert date strings to dayjs objects for DatePicker
          const formData = {
            ...franchise,
            contractStartDate: franchise.contractStartDate ? dayjs(franchise.contractStartDate) : null,
            contractEndDate: franchise.contractEndDate ? dayjs(franchise.contractEndDate) : null
          }
          form.setFieldsValue(formData)
        }
      } catch {}
      finally { setLoading(false) }
    }
    loadData()
  }, [id])

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      // Convert dayjs objects to ISO strings for API
      const formData = {
        ...values,
        contractStartDate: values.contractStartDate ? values.contractStartDate.toISOString() : null,
        contractEndDate: values.contractEndDate ? values.contractEndDate.toISOString() : null
      }
      
      if (id) {
        await updateFranchise(id, formData)
        message.success('Franchise updated successfully')
      } else {
        await createFranchise(formData)
        message.success('Franchise created successfully')
      }
      navigate('/franchises')
    } catch {
      message.error('Save failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: 24 }}>
      <Card title={id ? 'Edit Franchise' : 'New Franchise'}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="franchiseName" label="Franchise Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="franchiseCode" label="Franchise Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ownerId" label="Owner" rules={[{ required: true }]}>
            <Select placeholder="Select owner">
              {users.map(u => (
                <Select.Option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="territory" label="Territory" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="city" label="City" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="state" label="State" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="postalCode" label="Postal Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="franchiseFee" label="Franchise Fee" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} prefix="$" />
          </Form.Item>
          <Form.Item name="royaltyRate" label="Royalty Rate (%)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.1} />
          </Form.Item>
          <Form.Item name="contractStartDate" label="Contract Start Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="contractEndDate" label="Contract End Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {id ? 'Update Franchise' : 'Create Franchise'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default FranchiseForm
