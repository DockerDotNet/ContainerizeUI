import defaultProps from '@/defaultProps';
import {
    DockerOutlined,
    GithubFilled,
    InfoCircleFilled,
    LogoutOutlined,
    MoonOutlined,
    QuestionCircleFilled,
    SunOutlined
} from '@ant-design/icons';
import {
    PageContainer,
    ProCard,
    ProConfigProvider,
    ProLayout,
    ProSettings,
    SettingDrawer
} from '@ant-design/pro-components';
import { Button, ConfigProvider, Dropdown, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';

const BasicLayout = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

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
    const { pageExtra, pageFooter } = useOutletContext<{ pageExtra?: React.ReactNode; pageFooter?: React.ReactNode[] }>() || {};

    return (
        <div id="containerize-layout" style={{ height: "95dvh", display: "flex", flexDirection: "column" }}>
            <ProConfigProvider hashed={false}>
                <ConfigProvider getTargetContainer={() => document.getElementById('containerize-layout') || document.body}>
                    <ProLayout
                        prefixCls="containerize"
                        title="Containerize"
                        lang="en-US"
                        logo={<DockerOutlined />}
                        {...defaultProps}
                        location={{ pathname }}
                        token={{ header: { colorBgMenuItemSelected: 'rgba(0,0,0,0.04)' } }}
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
                            <InfoCircleFilled key="info" />,
                            <QuestionCircleFilled key="help" />,
                            <GithubFilled key="github" />,
                            <Tooltip title="Toggle Theme">
                                <Button
                                    icon={themeMode === "dark" ? <MoonOutlined /> : <SunOutlined />}
                                    onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
                                    type="text" />
                            </Tooltip>,
                        ]}
                        headerTitleRender={(logo, title) => (
                            <a>
                                {logo}
                                {title}
                            </a>
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
                                <Outlet context={{ setUser, user }} />
                            </ProCard>
                        </PageContainer>

                        <SettingDrawer
                            pathname={pathname}
                            enableDarkTheme
                            getContainer={() => document.getElementById('containerize-layout')}
                            settings={settings}
                            onSettingChange={(changeSetting) => setSetting(changeSetting)}
                            disableUrlParams={false}
                        />
                    </ProLayout>
                </ConfigProvider>
            </ProConfigProvider>
        </div>
    );
};

export default BasicLayout;
