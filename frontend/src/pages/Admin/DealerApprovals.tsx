import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Popconfirm, message, Tag, Modal, Input, Image, Timeline } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { getDealers, approveDealerKyc, rejectDealerKyc, getDealerKycStatus } from '../../services/dealerService'
import { Dealer } from '../../types/dealer'
import { Link } from 'react-router-dom'

const { TextArea } = Input

type KycDocument = {
  id: string
  documentType: string
  documentNumber: string
  documentUrl?: string
  verificationStatus: string
  verifiedAt?: string
  notes?: string
}

const DealerApprovals: React.FC = () => {
  const [items, setItems] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)
  const [kycDocuments, setKycDocuments] = useState<KycDocument[]>([])
  const [approvalNotes, setApprovalNotes] = useState('')
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')

  const load = async () => {
    setLoading(true)
    try {
      const all = await getDealers()
      console.log('All dealers:', all) // Debug log
      // Show all dealers, not just pending ones for now
      const dealersWithKyc = (all || []).filter((d: any) => {
        // Show dealers that have any status
        return d.kycStatus || d.status
      })
      console.log('Filtered dealers:', dealersWithKyc) // Debug log
      setItems(dealersWithKyc)
    } catch (error) {
      console.error('Error loading dealers:', error)
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { load() }, [])

  const showKycModal = async (dealer: Dealer) => {
    console.log('Opening KYC modal for dealer:', dealer)
    setSelectedDealer(dealer)
    try {
      console.log('Fetching KYC for dealer ID:', dealer.id)
      const docs = await getDealerKycStatus(dealer.id)
      console.log('KYC documents received:', docs)
      setKycDocuments(Array.isArray(docs) ? docs : [])
    } catch (error) {
      console.error('Error fetching KYC documents:', error)
      setKycDocuments([])
    }
    setModalVisible(true)
  }

  const handleApproval = async () => {
    if (!selectedDealer) return
    
    try {
      console.log('Approving dealer:', selectedDealer.id, actionType) // Debug
      
      if (actionType === 'approve') {
        await approveDealerKyc(selectedDealer.id, 'Approved', approvalNotes)
        message.success('Dealer approved successfully')
      } else {
        await approveDealerKyc(selectedDealer.id, 'Rejected', approvalNotes)
        message.success('Dealer rejected successfully')
      }
      
      setModalVisible(false)
      setApprovalNotes('')
      load()
    } catch (error: any) {
      console.error('Approval error:', error)
      message.error(`${actionType === 'approve' ? 'Approval' : 'Rejection'} failed: ${error?.response?.data?.message || error?.message || 'Unknown error'}`)
    }
  }

  const handleApprove = async (id: string) => {
    try { await approveDealerKyc(id, 'Approved'); message.success('Approved'); load() } catch { message.error('Approve failed') }
  }
  const handleReject = async (id: string) => {
    try { await rejectDealerKyc(id); message.success('Rejected'); load() } catch { message.error('Reject failed') }
  }

  const columns = [
    { title: 'Name', dataIndex: 'businessName', key: 'businessName', render: (val: string, rec: any) => val || rec.name },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Business Type', dataIndex: 'businessType', key: 'businessType' },
    { title: 'Status', key: 'status', render: (_: any, rec: any) => {
      const status = rec.kycStatus || rec.status || 'Not Submitted'
      const color = status === 'Approved' ? 'green' : 
                   status === 'Rejected' ? 'red' : 
                   status === 'Pending' ? 'orange' : 'default'
      return <Tag color={color}>{status}</Tag>
    }},
    { title: 'Actions', key: 'actions', render: (_: any, rec: Dealer) => (
      <Space>
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => showKycModal(rec)}
        >
          Review KYC
        </Button>
        <Link to={`/dealers/${rec.id}`}><Button type="link">View</Button></Link>
        <Popconfirm title="Approve this dealer?" onConfirm={() => handleApprove(rec.id)}>
          <Button type="primary" size="small">Quick Approve</Button>
        </Popconfirm>
        <Popconfirm title="Reject this dealer?" onConfirm={() => handleReject(rec.id)}>
          <Button danger size="small">Quick Reject</Button>
        </Popconfirm>
      </Space>
    )}
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card title="Dealer Approvals">
        <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}>
          <strong>Debug Info:</strong> Modal Visible: {modalVisible ? 'YES' : 'NO'} | 
          Selected Dealer: {selectedDealer?.businessName || 'None'} | 
          KYC Docs: {kycDocuments.length}
        </div>
        <Table rowKey="id" dataSource={items} columns={columns} loading={loading} />
      </Card>

      <Modal
        title={`KYC Review - ${selectedDealer?.businessName || selectedDealer?.name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
        destroyOnClose={true}
      >
        <div style={{ marginBottom: 16 }}>
          <h4>Dealer Information</h4>
          <p><strong>Business Name:</strong> {selectedDealer?.businessName}</p>
          <p><strong>Business Type:</strong> {selectedDealer?.businessType}</p>
          <p><strong>Registration Number:</strong> {selectedDealer?.registrationNumber}</p>
          <p><strong>Tax ID:</strong> {selectedDealer?.taxId}</p>
          <p><strong>Address:</strong> {selectedDealer?.address}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4>KYC Documents</h4>
          {kycDocuments.length > 0 ? (
            <Timeline>
              {kycDocuments.map(doc => (
                <Timeline.Item key={doc.id}>
                  <div>
                    <strong>{doc.documentType}:</strong> {doc.documentNumber}
                    <br />
                    <small>Status: <Tag color={doc.verificationStatus === 'APPROVED' ? 'green' : doc.verificationStatus === 'REJECTED' ? 'red' : 'orange'}>{doc.verificationStatus}</Tag></small>
                    <br />
                    <small>Uploaded: {doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleDateString() : 'Pending'}</small>
                    {doc.documentUrl && (
                      <div style={{ marginTop: 8 }}>
                        <Image
                          width={200}
                          src={`${import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${doc.documentUrl.replace(/\\/g, '/')}`}
                          placeholder="Document preview"
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <p>No KYC documents found</p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4>Approval Notes</h4>
          <TextArea
            rows={4}
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Add notes for approval/rejection..."
          />
        </div>

        <div style={{ 
          textAlign: 'center', 
          borderTop: '2px solid #1890ff', 
          paddingTop: 20, 
          backgroundColor: '#f0f8ff',
          margin: '16px -24px -24px -24px',
          padding: '20px'
        }}>
          <h4 style={{ marginBottom: 20, color: '#1890ff' }}>🔍 Review Actions</h4>
          <Space size="large">
            <Button 
              size="large"
              onClick={() => {
                console.log('Cancel clicked')
                setModalVisible(false)
              }}
              style={{ minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button 
              size="large"
              danger 
              onClick={() => { 
                console.log('Rejecting dealer:', selectedDealer?.id)
                setActionType('reject'); 
                handleApproval(); 
              }}
              disabled={kycDocuments.length === 0}
              style={{ minWidth: 120 }}
            >
              🚫 Reject KYC
            </Button>
            <Button 
              size="large"
              type="primary" 
              onClick={() => { 
                console.log('Approving dealer:', selectedDealer?.id)
                setActionType('approve'); 
                handleApproval(); 
              }}
              disabled={kycDocuments.length === 0}
              style={{ minWidth: 120 }}
            >
              ✅ Approve KYC
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  )
}

export default DealerApprovals
