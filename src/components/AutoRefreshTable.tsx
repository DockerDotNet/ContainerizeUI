import {
  ClockCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { ProTable, ProTableProps } from "@ant-design/pro-components";
import { Dropdown, MenuProps, Space, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import { FaA } from "react-icons/fa6";

interface AutoRefreshTableProps<T, U> extends ProTableProps<T, U> {
  fetchData?: () => void;
}

function ClockWithA() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      <ClockCircleOutlined style={{ fontSize: 16 }} />
      <FaA style={{ fontSize: 10 }} />
    </div>
  );
}

const AutoRefreshTable = <T extends Record<string, any>, U extends Record<string, any>>({
  fetchData,
  toolBarRender,
  ...rest
}: AutoRefreshTableProps<T, U>) => {
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);
  const [isAutoRefresh, setAutoRefresh] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFetchData = async () => {
    if (!fetchData) return;
    setLoading(true);
    try {
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const startAutoRefresh = (interval: number) => {
    stopAutoRefresh();
    if (interval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData?.();
      }, interval);
    }
  };

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isAutoRefresh && autoRefreshInterval > 0) {
      startAutoRefresh(autoRefreshInterval);
    } else {
      stopAutoRefresh();
    }

    return () => stopAutoRefresh();
  }, [isAutoRefresh, autoRefreshInterval]);

  const menuItems: MenuProps["items"] = [
    { key: "0", label: "Disable" },
    { key: "5000", label: "Every 5s" },
    { key: "10000", label: "Every 10s" },
    { key: "30000", label: "Every 30s" },
    { key: "60000", label: "Every 60s" },
  ];

  const handleIntervalChange: MenuProps["onClick"] = ({ key }) => {
    const interval = parseInt(key, 10);
    if (isNaN(interval) || interval === 0) {
      setAutoRefresh(false);
      setAutoRefreshInterval(0);
    } else {
      setAutoRefresh(true);
      setAutoRefreshInterval(interval);
    }
  };

  const refreshIcons = (
    <Space>
      {/* Set interval */}
      <Dropdown
        menu={{ items: menuItems, onClick: handleIntervalChange }}
        trigger={["click"]}
      >
        <Tooltip title="Set auto-refresh interval">
          <span style={{ cursor: "pointer" }}>
            <ClockCircleOutlined style={{ fontSize: 16 }} />
          </span>
        </Tooltip>
      </Dropdown>

      {/* Auto-refresh toggle */}
      <Tooltip title={isAutoRefresh ? "Disable Auto Refresh" : "Enable Auto Refresh"}>
        <span
          onClick={() => {
            if (isAutoRefresh) {
              setAutoRefresh(false);
              setAutoRefreshInterval(0);
            } else {
              setAutoRefresh(true);
              setAutoRefreshInterval(5000);
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <ClockWithA />
        </span>
      </Tooltip>

      {/* Manual refresh */}
      <Tooltip title="Refresh now">
        <span onClick={handleFetchData} style={{ cursor: "pointer" }}>
          <SyncOutlined style={{ fontSize: 16 }} />
        </span>
      </Tooltip>
    </Space>
  );

  const mergedToolBarRender = () => {
    // Check if toolBarRender is a function before calling it
    const userContent = typeof toolBarRender === 'function' ? toolBarRender(undefined, {}) : [];
    return [...userContent, refreshIcons];
  };

  return (
    <ProTable<T, U>
      {...rest}
      loading={loading}
      toolBarRender={mergedToolBarRender}
      options={{ ...rest.options, reload: false }} // disable built-in reload icon
    />
  );
};

export default AutoRefreshTable;