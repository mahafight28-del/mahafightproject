import React, { useMemo } from 'react'
import { Layout, Menu, Dropdown, Avatar } from 'antd'
import { UserOutlined, DashboardOutlined, ShoppingCartOutlined, FileTextOutlined, UserAddOutlined, AppstoreOutlined, BarChartOutlined, SettingOutlined, DollarOutlined, ScanOutlined } from '@ant-design/icons'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const { Header, Sider, Content } = Layout

const AppLayout: React.FC = () => {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const menuItems = useMemo(() => {
    const items: any[] = [
      { key: 'dashboard', label: <Link to="/dashboard">Dashboard</Link>, icon: <DashboardOutlined /> }
    ]

    if (hasRole('Admin')) {
      items.push(
        { key: 'dealers', label: <Link to="/dealers">All Dealers</Link>, icon: <UserOutlined /> },
        { key: 'dealer-approvals', label: <Link to="/admin/dealer-approvals">Dealer Approvals</Link>, icon: <SettingOutlined /> },
        { key: 'products', label: <Link to="/products">All Products</Link>, icon: <AppstoreOutlined /> },
        { key: 'sales', label: <Link to="/sales">All Sales</Link>, icon: <ShoppingCartOutlined /> },
        { key: 'invoices', label: <Link to="/invoices">All Invoices</Link>, icon: <FileTextOutlined /> },
        { key: 'commissions', label: <Link to="/commissions">All Commissions</Link>, icon: <DollarOutlined /> },
        { key: 'franchises', label: <Link to="/franchises">Franchises</Link>, icon: <UserAddOutlined /> },
        { key: 'users', label: <Link to="/users">User Management</Link>, icon: <UserOutlined /> },
        { key: 'reports', label: <Link to="/reports">Admin Reports</Link>, icon: <BarChartOutlined /> }
      )
    } else if (hasRole('Dealer')) {
      items.push(
        { key: 'kyc', label: <Link to="/dealers/kyc">KYC Documents</Link>, icon: <SettingOutlined /> },
        { key: 'products', label: <Link to="/products">Products Catalog</Link>, icon: <AppstoreOutlined /> },
        { key: 'pos', label: <Link to="/pos">POS Scan & Bill</Link>, icon: <ScanOutlined /> },
        { key: 'sales', label: <Link to="/sales">My Sales</Link>, icon: <ShoppingCartOutlined /> },
        { key: 'invoices', label: <Link to="/invoices">My Invoices</Link>, icon: <FileTextOutlined /> },
        { key: 'commissions', label: <Link to="/commissions">My Commissions</Link>, icon: <DollarOutlined /> }
      )
    } else {
      items.push(
        { key: 'products', label: <Link to="/products">View Products</Link>, icon: <AppstoreOutlined /> }
      )
    }

    return items
  }, [hasRole, user])

  const userMenu = {
    items: [
      { key: 'profile', label: 'Profile', onClick: () => navigate('/users/' + (user?.id || '')) },
      { key: 'logout', label: 'Logout', onClick: () => logout() }
    ]
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ height: 64, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', backgroundColor: '#000' }}>
          <img 
            src="/logo.jpg" 
            alt="MAHA FIGHT" 
            style={{ height: 40, marginRight: 8 }} 
          />
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>MAHA FIGHT</span>
        </div>
        <Menu theme="dark" mode="inline" items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              {user?.name || user?.email || 'User'}
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 16, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
