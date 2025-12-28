import React, { useMemo, useState, useEffect } from 'react'
import { Layout, Menu, Dropdown, Avatar, Button, Drawer } from 'antd'
import { UserOutlined, DashboardOutlined, ShoppingCartOutlined, FileTextOutlined, UserAddOutlined, AppstoreOutlined, BarChartOutlined, SettingOutlined, DollarOutlined, ScanOutlined, MenuOutlined } from '@ant-design/icons'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const { Header, Sider, Content } = Layout

const AppLayout: React.FC = () => {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992)
      if (window.innerWidth >= 992) {
        setMobileDrawerOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const menuItems = useMemo(() => {
    const items: any[] = [
      { 
        key: 'dashboard', 
        label: <Link to="/dashboard">Dashboard</Link>, 
        icon: <DashboardOutlined /> 
      }
    ]

    if (hasRole('Admin')) {
      items.push(
        { 
          key: 'dealers', 
          label: <Link to="/dealers">Dealers</Link>, 
          icon: <UserOutlined /> 
        },
        { 
          key: 'dealer-approvals', 
          label: <Link to="/admin/dealer-approvals">Approvals</Link>, 
          icon: <SettingOutlined /> 
        },
        { 
          key: 'products', 
          label: <Link to="/products">Products</Link>, 
          icon: <AppstoreOutlined /> 
        },
        { 
          key: 'sales', 
          label: <Link to="/sales">Sales</Link>, 
          icon: <ShoppingCartOutlined /> 
        },
        { 
          key: 'invoices', 
          label: <Link to="/invoices">Invoices</Link>, 
          icon: <FileTextOutlined /> 
        },
        { 
          key: 'commissions', 
          label: <Link to="/commissions">Commissions</Link>, 
          icon: <DollarOutlined /> 
        },
        { 
          key: 'franchises', 
          label: <Link to="/franchises">Franchises</Link>, 
          icon: <UserAddOutlined /> 
        },
        { 
          key: 'users', 
          label: <Link to="/users">Users</Link>, 
          icon: <UserOutlined /> 
        },
        { 
          key: 'reports', 
          label: <Link to="/reports">Reports</Link>, 
          icon: <BarChartOutlined /> 
        }
      )
    } else if (hasRole('Dealer')) {
      items.push(
        { 
          key: 'kyc', 
          label: <Link to="/dealers/kyc">KYC Documents</Link>, 
          icon: <SettingOutlined /> 
        },
        { 
          key: 'products', 
          label: <Link to="/products">Products</Link>, 
          icon: <AppstoreOutlined /> 
        },
        { 
          key: 'pos', 
          label: <Link to="/pos">POS System</Link>, 
          icon: <ScanOutlined /> 
        },
        { 
          key: 'sales', 
          label: <Link to="/sales">My Sales</Link>, 
          icon: <ShoppingCartOutlined /> 
        },
        { 
          key: 'invoices', 
          label: <Link to="/invoices">My Invoices</Link>, 
          icon: <FileTextOutlined /> 
        },
        { 
          key: 'commissions', 
          label: <Link to="/commissions">My Commissions</Link>, 
          icon: <DollarOutlined /> 
        }
      )
    } else {
      items.push(
        { 
          key: 'products', 
          label: <Link to="/products">Products</Link>, 
          icon: <AppstoreOutlined /> 
        }
      )
    }

    return items
  }, [hasRole])

  const getSelectedKey = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return ['dashboard']
    if (path.includes('/dealers') && path.includes('/kyc')) return ['kyc']
    if (path.includes('/dealers') && path.includes('/approvals')) return ['dealer-approvals']
    if (path.includes('/dealers')) return ['dealers']
    if (path.includes('/products')) return ['products']
    if (path.includes('/pos')) return ['pos']
    if (path.includes('/sales')) return ['sales']
    if (path.includes('/invoices')) return ['invoices']
    if (path.includes('/commissions')) return ['commissions']
    if (path.includes('/franchises')) return ['franchises']
    if (path.includes('/users')) return ['users']
    if (path.includes('/reports')) return ['reports']
    return []
  }

  const userMenu = {
    items: [
      { 
        key: 'profile', 
        label: 'Profile', 
        onClick: () => navigate('/users/' + (user?.id || '')) 
      },
      { 
        key: 'logout', 
        label: 'Logout', 
        onClick: () => logout() 
      }
    ]
  }

  const logoSection = (
    <div style={{ 
      height: 64, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
      padding: collapsed && !isMobile ? '0 8px' : '0 16px', 
      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <img 
        src="/logo.jpg" 
        alt="MAHA FIGHT" 
        style={{ 
          height: 32, 
          width: 32,
          borderRadius: 4,
          marginRight: collapsed && !isMobile ? 0 : 12 
        }} 
      />
      {(!collapsed || isMobile) && (
        <div>
          <div style={{ 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: '16px', 
            lineHeight: '20px'
          }}>
            MAHA FIGHT
          </div>
          <div style={{ 
            color: 'rgba(255,255,255,0.8)', 
            fontSize: '11px', 
            lineHeight: '12px'
          }}>
            {hasRole('Admin') ? 'Admin Panel' : hasRole('Dealer') ? 'Dealer Portal' : 'User Portal'}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider 
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={260}
          collapsedWidth={80}
          style={{
            background: '#001529',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
          }}
        >
          {logoSection}
          <Menu 
            theme="dark" 
            mode="inline" 
            items={menuItems}
            selectedKeys={getSelectedKey()}
            style={{ 
              borderRight: 0,
              background: 'transparent',
              fontSize: '14px'
            }}
          />
          
          {/* User info in collapsed sidebar */}
          {collapsed && (
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center'
            }}>
              <Avatar 
                icon={<UserOutlined />} 
                style={{ 
                  backgroundColor: '#1890ff',
                  cursor: 'pointer'
                }} 
                onClick={() => setCollapsed(false)}
              />
            </div>
          )}
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: 'none' }}
        width={260}
        style={{ zIndex: 1001 }}
      >
        {logoSection}
        <Menu 
          theme="dark" 
          mode="inline" 
          items={menuItems}
          selectedKeys={getSelectedKey()}
          onClick={() => setMobileDrawerOpen(false)}
          style={{ 
            borderRight: 0, 
            background: '#001529',
            fontSize: '14px'
          }}
        />
      </Drawer>

      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderBottom: '1px solid #f0f0f0',
          zIndex: 1000
        }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              style={{ 
                fontSize: '16px',
                height: 40,
                width: 40
              }}
            />
          )}
          
          {/* Page Title for Mobile */}
          {isMobile && (
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: '#262626',
              flex: 1,
              textAlign: 'center',
              marginLeft: -40
            }}>
              {location.pathname === '/dashboard' && 'Dashboard'}
              {location.pathname.includes('/products') && 'Products'}
              {location.pathname.includes('/pos') && 'POS System'}
              {location.pathname.includes('/sales') && 'Sales'}
              {location.pathname.includes('/dealers') && 'Dealers'}
              {location.pathname.includes('/invoices') && 'Invoices'}
              {location.pathname.includes('/commissions') && 'Commissions'}
            </div>
          )}
          
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}>
              <Avatar 
                icon={<UserOutlined />} 
                size={32}
                style={{ 
                  backgroundColor: '#1890ff',
                  marginRight: isMobile ? 0 : 8
                }} 
              />
              {!isMobile && (
                <div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    color: '#262626',
                    lineHeight: '18px'
                  }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#8c8c8c',
                    lineHeight: '14px'
                  }}>
                    {user?.roles?.[0] || 'User'}
                  </div>
                </div>
              )}
            </div>
          </Dropdown>
        </Header>
        
        <Content style={{ 
          margin: isMobile ? 8 : 16, 
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto'
        }}>
          <div style={{ 
            background: '#fff', 
            padding: isMobile ? 12 : 24, 
            borderRadius: 8,
            minHeight: '100%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
