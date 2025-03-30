import defaultProps from '@/defaultProps';
import {
    DockerOutlined,
    LogoutOutlined,
    MoonOutlined,
    SunOutlined
} from '@ant-design/icons';
import {
    PageContainer,
    ProCard,
    ProConfigProvider,
    ProLayout,
    ProSettings
} from '@ant-design/pro-components';
import { Button, ConfigProvider, Dropdown, Select, Space, Tooltip } from 'antd';
import enUS from "antd/locale/en_US";
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';

const BasicLayout = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [pageExtra, setPageExtra] = useState<React.ReactNode | undefined>(undefined);

    // Detect system theme
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const [themeMode, setThemeMode] = useState<string>(
        localStorage.getItem('themeMode') || (systemPrefersDark ? 'dark' : 'light')
    );

    const [settings, setSetting] = useState<Partial<ProSettings>>({
        fixSiderbar: true,
        layout: "mix",
        splitMenus: false,
        navTheme: themeMode === "dark" ? "realDark" : "light",
        contentWidth: "Fluid",
        colorPrimary: "#1677FF",
        siderMenuType: "sub",
        fixedHeader: true
    });

    useEffect(() => {
        localStorage.setItem('themeMode', themeMode);
        document.body.classList.toggle('dark', themeMode === 'dark');
        setSetting((prev) => ({
            ...prev,
            navTheme: themeMode === "dark" ? "realDark" : "light"
        }));
    }, [themeMode]);

    // Fake user for now (Replace with API call later)
    const [user, setUser] = useState<{ name: string }>({
        name: localStorage.getItem('username') || 'Admin'
    });

    // Generate UI-Avatar URL
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=64&background=random`;

    // Use context from child pages for extra & footer
    const { pageFooter } = useOutletContext<{ pageFooter?: React.ReactNode[] }>() || {};

    // TODO: Replace with real server data
    const servers = [
        {
            label: 'Production',
            options: [
                { label: 'Server 1', value: 'prod-1' },
                { label: 'Server 2', value: 'prod-2' },
            ],
        },
        {
            label: 'Staging',
            options: [
                { label: 'Server A', value: 'stage-a' },
                { label: 'Server B', value: 'stage-b' },
            ],
        },
    ];

    // TODO: Handle server change event
    const handleServerChange = (value: string) => {
        console.log('Selected server:', value);
    };

    return (
        <div id="containerize-layout" style={{ height: "95dvh", display: "flex", flexDirection: "column" }}>
            <ConfigProvider getTargetContainer={() => document.getElementById('containerize-layout') || document.body} locale={enUS}>
                <ProConfigProvider hashed={false} >
                    <ProLayout
                        prefixCls="containerize"
                        title="Containerize"
                        lang="en-US"
                        logo={<DockerOutlined />}
                        {...defaultProps}
                        location={{ pathname }}
                        token={{ header: { colorBgMenuItemSelected: 'rgba(0,0,0,0.04)' } }}
                        style={{ height: "95dvh" }}
                        siderMenuType="group"
                        menu={{ collapsedShowGroupTitle: true }}
                        avatarProps={{
                            src: avatarUrl,
                            size: 'small',
                            title: user.name,
                            render: (_props, dom) => (
                                <Dropdown menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Logout' }] }}>
                                    {dom}
                                </Dropdown>
                            ),
                        }}
                        actionsRender={(props) => props.isMobile ? [] : [
                            <Tooltip title="Toggle Theme">
                                <Button
                                    icon={themeMode === "dark" ? <MoonOutlined /> : <SunOutlined />}
                                    onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
                                    type="text" />
                            </Tooltip>,
                        ]}
                        headerTitleRender={(logo, title) => (
                            <Space size={'large'}>
                                <a>
                                    {logo}
                                    {title}
                                </a>

                                <Select
                                    style={{ width: 200 }}
                                    placeholder="Select Server"
                                    options={servers}
                                    onChange={handleServerChange}
                                    allowClear
                                />
                            </Space>
                        )}
                        menuFooterRender={(props) =>
                            !props?.collapsed ? <div style={{ textAlign: 'center', paddingBlockStart: 12 }}>© 2025 Containerize</div> : undefined
                        }
                        onMenuHeaderClick={(e) => console.log(e)}
                        menuItemRender={(item, dom) => (
                            <div onClick={() => navigate(item.path || '/')} style={{ cursor: 'pointer' }}>
                                {dom}
                            </div>
                        )}
                        {...settings}
                        className="containerize-layout-pro"
                    >
                        <PageContainer
                            extra={pageExtra}  // Dynamically controlled by the current tab
                            footer={pageFooter ?? []} // Ensure it's always an array
                            style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
                        >
                            <ProCard style={{ flex: 1, height: "100%", overflow: "auto" }}>
                                <Outlet context={{ setUser, user, setPageExtra }} />
                            </ProCard>
                        </PageContainer>

                        {/* <SettingDrawer
                            pathname={pathname}
                            enableDarkTheme
                            getContainer={() => document.getElementById('containerize-layout')}
                            settings={settings}
                            onSettingChange={(changeSetting) => setSetting(changeSetting)}
                            disableUrlParams={false}
                        /> */}
                    </ProLayout>
                </ProConfigProvider>
            </ConfigProvider>
        </div>
    );
};

export default BasicLayout;
