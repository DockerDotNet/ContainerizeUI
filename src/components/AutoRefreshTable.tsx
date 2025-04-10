import AutoRefreshIcon from "@/assets/autorefresh.svg?react";
import AutoRefreshOffIcon from "@/assets/refreshoff.svg?react";
import { ProTable, ProTableProps } from "@ant-design/pro-components";
import { Dropdown, MenuProps, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";

interface AutoRefreshTableProps<T, U> extends ProTableProps<T, U> {
  fetchData?: () => void;
}

const AutoRefreshTable = <
  T extends Record<string, any>,
  U extends Record<string, any>
>({
  fetchData,
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
        handleFetchData();
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
    handleFetchData();
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

  const refreshControls = [
    <Tooltip key="auto-refresh" title={isAutoRefresh ? `Interval: ${autoRefreshInterval / 1000}s (Click to change)` : "Auto-refresh disabled (Click to enable)"}>
      <Dropdown
        menu={{ items: menuItems, onClick: handleIntervalChange }}
        trigger={["click"]}
      >
        <span className="flex cursor-pointer">
          {isAutoRefresh ? (
            <AutoRefreshIcon style={{ width: 18, height: 18 }} />
          ) : (
            <AutoRefreshOffIcon style={{ width: 18, height: 18 }} />
          )}
        </span>
      </Dropdown>
    </Tooltip>
  ];

  return (
    <ProTable<T, U>
      {...rest}
      loading={loading}
      options={{
        ...(rest.options !== false ? rest.options : {}),
        //reload: false, // handled by custom button
        // density: true,
        // search: false,
      }}
      optionsRender={(props, defaultDom) => [...refreshControls, ...defaultDom]}
    />
  );
};

export default AutoRefreshTable;
