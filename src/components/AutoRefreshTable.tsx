import { refreshOptions } from "@/config/RefreshOptions";
import { ProTable, ProTableProps } from "@ant-design/pro-components";
import { Button, Dropdown, Space } from "antd";
import { MenuProps } from "antd/lib";
import { useEffect, useState } from "react";

interface AutoRefreshTableProps<T, U extends Record<string, any>> extends ProTableProps<T, U> {
  fetchData: () => Promise<void>;
  setPageExtra?: (extra: React.ReactNode) => void;
}

const AutoRefreshTable = <T extends Record<string, any>, U extends Record<string, any>>({
  fetchData,
  setPageExtra,
  ...proTableProps
}: AutoRefreshTableProps<T, U>) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isAutoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  useEffect(() => {
    if (isAutoRefresh && autoRefreshInterval > 0) {
      const fetchIfActive = () => {
        if (document.visibilityState === "visible") {
          console.log("Refreshing every:", autoRefreshInterval, "ms");
          handleFetchData();
        } else {
          console.log("Tab Inactive - Skipping Refresh");
        }
      };

      // Initial fetch
      fetchIfActive();

      const interval = setInterval(fetchIfActive, autoRefreshInterval);

      // Cleanup on unmount or dependency change
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, autoRefreshInterval]);

  useEffect(() => {
    if (setPageExtra) {
      const menuItems: MenuProps["items"] = refreshOptions.map((option) => ({
        key: option.value.toString(),
        label: option.label,
        onClick: () => {
          if (option.value === 0) {
            setAutoRefreshInterval(0);
            setAutoRefresh(false);
            return;
          }
          setAutoRefresh(true);
          setAutoRefreshInterval(option.value);
        },
      }));

      setPageExtra(
        <Space>
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button type="default">Auto Refresh</Button>
          </Dropdown>
        </Space>
      );
    }

    return () => {
      if (setPageExtra) {
        setPageExtra(undefined);
      }
    };
  }, [setPageExtra]);

  return (
    <ProTable<T, U>
      {...proTableProps}
      loading={loading}
      options={{
        ...proTableProps.options,
        reload: handleFetchData,
      }}
    />
  );
};

export default AutoRefreshTable;