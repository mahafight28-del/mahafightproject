import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Tag, Popconfirm, message, Row, Col, Statistic, Table, Upload, Modal, Form, Input, Select } from 'antd'
import { EditOutlined, ArrowLeftOutlined, DollarOutlined, UploadOutlined, FileOutlined } from '@ant-design/icons'
import { getDealer, getDealerKycStatus, approveDealerKyc, rejectDealerKyc, uploadKycDocument } from '../../services/dealerService'
import { getSales } from '../../services/saleService'
import { getCommissions } from '../../services/commissionService'
import { Dealer } from '../../types/dealer'
import { useAuth } from '../../context/AuthContext'

const DealerDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dealer, setDealer] = useState<Dealer | null>(null)
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [kycDocuments, setKycDocuments] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [commissions, setCommissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [uploadForm] = Form.useForm()
  const { hasRole } = useAuth()

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [dealerData, salesData, commissionsData] = await Promise.all([
        getDealer(id),
        getSales(),
        getCommissions(id)
      ])
      setDealer(dealerData)
      setSales((salesData || []).filter((s: any) => s.dealerId === id))
      setCommissions(commissionsData || [])
      if (dealerData?.id) fetchKyc(dealerData.id)
    } catch {
      message.error('Failed to load dealer data')
    } finally {
      setLoading(false)
    }
  }

  const fetchKyc = async (dealerId: string) => {
    try {
      const res = await getDealerKycStatus(dealerId)
      setKycDocuments(res || [])
      
      // Calculate overall KYC status
      let status = 'Not Submitted'
      if (res && res.length > 0) {
        if (res.some((doc: any) => doc.verificationStatus === 'APPROVED')) {
          status = 'Approved'
        } else if (res.some((doc: any) => doc.verificationStatus === 'REJECTED')) {
          status = 'Rejected'
        } else if (res.some((doc: any) => doc.verificationStatus === 'PENDING')) {
          status = 'Pending'
        }
      }
      
      console.log('KYC Status calculated:', status, 'Documents:', res)
      setKycStatus(status)
    } catch {
      setKycStatus('Not Submitted')
      setKycDocuments([])
    }
  }

  const handleApprove = async () => {
    if (!id) return
    try {
      await approveDealerKyc(id, 'Approved')
      message.success('Dealer approved successfully')
      fetchKyc(id)
    } catch {
      message.error('Approval failed')
    }
  }

  const handleReject = async () => {
    if (!id) return
    try {
      await rejectDealerKyc(id)
      message.success('Dealer rejected')
      fetchKyc(id)
    } catch {
      message.error('Rejection failed')
    }
  }

  const handleUploadKyc = async (values: any) => {
    if (!id || !values.file?.file) return
    
    try {
      await uploadKycDocument(id, values.documentType, values.documentNumber, values.file.file)
      message.success('Document uploaded successfully')
      setUploadModalVisible(false)
      uploadForm.resetFields()
      fetchKyc(id)
    } catch {
      message.error('Upload failed')
    }
  }

  const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  const totalCommissions = commissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0)
  const pendingCommissions = commissions.filter(c => c.paymentStatus === 'Pending').reduce((sum, c) => sum + (c.commissionAmount || 0), 0)

  const salesColumns = [
    { title: 'Sale #', dataIndex: 'saleNumber', key: 'saleNumber' },
    { title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount', render: (val: number) => `$${val?.toFixed(2)}` },
    { title: 'Date', dataIndex: 'saleDate', key: 'saleDate', render: (val: string) => new Date(val).toLocaleDateString() }
  ]

  const kycColumns = [
    { title: 'Document Type', dataIndex: 'documentType', key: 'documentType' },
    { title: 'Document Number', dataIndex: 'documentNumber', key: 'documentNumber' },
    { title: 'Status', dataIndex: 'verificationStatus', key: 'status', render: (status: string) => (
      <Tag color={status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'orange'}>{status}</Tag>
    )},
    { title: 'Uploaded', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => new Date(val).toLocaleDateString() }
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={`Dealer: ${dealer?.businessName || dealer?.name || 'Loading...'}`}
        extra={
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
              Back
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/dealers/${id}/edit`)}>
              Edit
            </Button>
          </div>
        }
        loading={loading}
      >
        {dealer && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Statistic title="Total Sales" value={totalSales} precision={2} prefix={<DollarOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="Total Commissions" value={totalCommissions} precision={2} prefix={<DollarOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="Pending Commissions" value={pendingCommissions} precision={2} prefix={<DollarOutlined />} />
              </Col>
            </Row>

            <Descriptions column={2} bordered>
              <Descriptions.Item label="Business Name">{dealer.businessName || dealer.name}</Descriptions.Item>
              <Descriptions.Item label="Business Type">{dealer.businessType}</Descriptions.Item>
              <Descriptions.Item label="Email">{dealer.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{dealer.phone}</Descriptions.Item>
              <Descriptions.Item label="Registration Number">{dealer.registrationNumber}</Descriptions.Item>
              <Descriptions.Item label="Tax ID">{dealer.taxId}</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {dealer.address}, {dealer.city}, {dealer.state} {dealer.postalCode}
              </Descriptions.Item>
              <Descriptions.Item label="Commission Rate">{dealer.commissionRate}%</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={dealer.isActive ? 'green' : 'red'}>{dealer.isActive ? 'Active' : 'Inactive'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="KYC Status">
                {kycStatus ? (
                  <Tag color={kycStatus === 'Approved' ? 'green' : kycStatus === 'Rejected' ? 'red' : 'orange'}>
                    {kycStatus}
                  </Tag>
                ) : (
                  <Tag>Unknown</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created">{new Date(dealer.createdAt || '').toLocaleDateString()}</Descriptions.Item>
            </Descriptions>

            {hasRole('Admin') && kycStatus === 'Pending' && (
              <div style={{ marginTop: 16 }}>
                <Popconfirm title="Approve this dealer?" onConfirm={handleApprove}>
                  <Button type="primary" style={{ marginRight: 8 }}>Approve KYC</Button>
                </Popconfirm>
                <Popconfirm title="Reject this dealer?" onConfirm={handleReject}>
                  <Button danger>Reject KYC</Button>
                </Popconfirm>
              </div>
            )}

            <Card title="KYC Documents" style={{ marginTop: 24 }} extra={
              <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModalVisible(true)}>
                Upload Document
              </Button>
            }>
              <Table 
                dataSource={kycDocuments} 
                columns={kycColumns} 
                rowKey="id" 
                pagination={false}
                size="small"
              />
            </Card>

            <Card title="Recent Sales" style={{ marginTop: 24 }}>
              <Table 
                dataSource={sales.slice(0, 10)} 
                columns={salesColumns} 
                rowKey="id" 
                pagination={false}
                size="small"
              />
            </Card>
          </>
        )}
      </Card>

      <Modal
        title="Upload KYC Document"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <Form form={uploadForm} onFinish={handleUploadKyc} layout="vertical">
          <Form.Item name="documentType" label="Document Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="PAN">PAN Card</Select.Option>
              <Select.Option value="Aadhaar">Aadhaar Card</Select.Option>
              <Select.Option value="Photo">Photo</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="documentNumber" label="Document Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="file" label="Document File" rules={[{ required: true }]}>
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Upload Document
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DealerDetail