import React, { useState } from 'react'
import { Card, Form, Input, Button, Upload, message, Tag } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { RcFile, UploadFile } from 'antd/es/upload/interface'
import { registerDealer, getDealerKycStatus } from '../../services/dealerService'

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
const AADHAAR_REGEX = /^\d{12}$/

const beforeUpload = (file: RcFile) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) message.error('You can only upload image files')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) message.error('Image must be smaller than 5MB')
  return isImage && isLt5M
}

const Registration: React.FC = () => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [registeredId, setRegisteredId] = useState<string | null>(null)

  const handleUploadChange = ({ fileList: next }: { fileList: UploadFile[] }) => setFileList(next)

  const onFinish = async (values: any) => {
    const dealerData = {
      email: values.email || '',
      password: 'temp123', // Default password, should be changed
      firstName: values.name.split(' ')[0] || '',
      lastName: values.name.split(' ').slice(1).join(' ') || '',
      phone: values.phone || '',
      businessName: values.name,
      businessType: 'Individual',
      registrationNumber: values.pan,
      taxId: values.aadhaar,
      address: 'Not provided',
      city: 'Not provided',
      state: 'Not provided',
      postalCode: '000000',
      country: 'India'
    }

    setSubmitting(true)
    try {
      const res = await registerDealer(dealerData)
      const id = res.id || res.dealerId || null
      const kycStatus = res.status || 'Pending'
      setRegisteredId(id)
      setStatus(kycStatus)
      message.success('Registration submitted')
    } catch (err: any) {
      message.error(err?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  const checkStatus = async () => {
    if (!registeredId) return
    try {
      const res = await getDealerKycStatus(registeredId)
      setStatus(res.status || res.kycStatus || 'Pending')
      message.info('Status updated')
    } catch {
      message.error('Failed to fetch status')
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Card title="Dealer Registration">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Full name" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', required: false }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone"> 
            <Input />
          </Form.Item>

          <Form.Item name="pan" label="PAN" rules={[{ required: true, pattern: PAN_REGEX, message: 'Invalid PAN format' }]}>
            <Input placeholder="ABCDE1234F" />
          </Form.Item>

          <Form.Item name="aadhaar" label="Aadhaar" rules={[{ required: true, pattern: AADHAAR_REGEX, message: 'Aadhaar must be 12 digits' }]}>
            <Input placeholder="123412341234" />
          </Form.Item>

          <Form.Item label="Photo">
            <Upload
              beforeUpload={beforeUpload}
              fileList={fileList}
              onChange={handleUploadChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Photo</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>Submit Registration</Button>
          </Form.Item>
        </Form>

        {status && (
          <div style={{ marginTop: 16 }}>
            <div>Status: {status === 'Approved' ? <Tag color="green">Approved</Tag> : <Tag color="orange">{status}</Tag>}</div>
            {registeredId && <Button style={{ marginTop: 8 }} onClick={checkStatus}>Refresh Status</Button>}
          </div>
        )}
      </Card>
    </div>
  )
}

export default Registration
