import { Breadcrumb, Layout, Menu, theme } from 'antd'
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const { Header, Footer, Content } = Layout

const menuItemsConfig = [
  {
    path: '/position_builder',
    title: "Position Builder"
  }
].map((m, idx) => {
  return {
    ...m,
    key: idx.toString(),
  }
})

const menuItems = menuItemsConfig.map((m) => {
  return {
    key: m.key,
    label: <NavLink to={m.path}>{m.title}</NavLink>
  }
})

const MyLayout = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [selectedMenuItem, setSelectMenuItem] = useState(['1'])
  const location = useLocation()

  const breadcrumbItems = [
    {
      title: <Link to='/'>Home</Link>,
    },
  ]

  useEffect(() => {
    const filteredMenuItem = menuItemsConfig.filter((m) => m.path == location.pathname)
    if (filteredMenuItem.length > 0) {
      setSelectMenuItem([filteredMenuItem[0].key])
    } else {
      setSelectMenuItem([])
    }
  }, [location])

  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px 0 12px',
        }}
      >
        <div className="demo-logo"><Link to='/'>Greeks</Link></div>
        <Menu theme="dark" mode="horizontal" items={menuItems} selectedKeys={selectedMenuItem} />
      </Header>
      <Content
        style={{
          padding: '0 24px',
        }}
      >
        <Breadcrumb
          style={{
            margin: '16px 0',
          }}
          items={breadcrumbItems} />
        <Layout
          style={{
            padding: '0',
            background: colorBgContainer,
          }}
        >
          <Content
            style={{
              padding: '0',
              minHeight: 640,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
        }}
      >
        AA©2023
      </Footer>
    </Layout>
  );
};
export default MyLayout
