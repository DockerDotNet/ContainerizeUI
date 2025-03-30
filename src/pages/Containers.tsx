/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { refreshOptions } from "@/config/RefreshOptions";
import { statusBadgeMap, StatusEnum } from "@/enums/ContainerState";
import ContainersService from "@/services/containersService";
import { useAutoRefresh } from "@/stores/useAutoRefresh";
import {
  ProColumns,
  ProDescriptions,
  ProDescriptionsItemProps,
  ProTable,
} from "@ant-design/pro-components";
import { Badge, Button, Drawer, Dropdown, Input, Space, Tooltip } from "antd";
import { MenuProps } from "antd/lib";
import { useEffect, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";

interface Container {
  Id: string;
  Names: string[];
  Image: string;
  State: StatusEnum;
  Status: string;
  Ports: {
    IP: string;
    PrivatePort: number;
    PublicPort: number;
    Type: string;
  }[];
}

const Containers = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<Container | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const {setAutoRefreshInterval,isAutoRefresh,setAutoRefresh, autoRefreshInterval} = useAutoRefresh();
  const { setPageExtra } = useOutletContext<{ 
    setUser?: React.Dispatch<React.SetStateAction<{ name: string }>>;
    user?: { name: string };
    setPageExtra?: (extra: React.ReactNode) => void;
}>() || {};

  const fetchContainers = async () => {
    setLoading(true);
    try {
      // Build query params for status filter
      const filters: Record<string, any> = { all: true };
      if (statusFilters.length > 0) {
        filters["filters[status]"] = Object.fromEntries(
          statusFilters.map((status) => [status, true])
        );
      }

      const response = await ContainersService.listContainers(filters);
      setContainers(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, [statusFilters])
  

  useEffect(() => {
    if (isAutoRefresh && autoRefreshInterval > 0) {
      const fetchIfActive = () => {
        if (document.visibilityState === "visible") {
          console.log("Refreshing every:", autoRefreshInterval, "ms");
          fetchContainers();
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
          if(option.value === 0) {
            setAutoRefreshInterval(0);
            setAutoRefresh(false);
            return;
          }
          setAutoRefresh(true);
          setAutoRefreshInterval(option.value)
        },
      }));
      setPageExtra(
        <Space>
        <Dropdown menu={{ items: menuItems }} trigger={["click"]} >
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
}, [setPageExtra, setAutoRefreshInterval]);

  const columns: ProColumns<Container>[] = [
    {
      title: "Container ID",
      dataIndex: "Id",
      key: "Id",
      copyable: true,
      ellipsis: true,
      width: 120,
      sorter: (a, b) => a.Id.localeCompare(b.Id),
    },
    {
      title: "Name",
      dataIndex: "Names",
      key: "Names",
      sorter: (a, b) => a.Names[0].localeCompare(b.Names[0]),
      render: (_, record) => (
        <a
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        >
          {record.Names?.[0]?.substring(1) || "N/A"}
        </a>
      ),
    },
    {
      title: "Image",
      dataIndex: "Image",
      key: "Image",
      sorter: (a, b) => a.Image.localeCompare(b.Image),
    },
    {
      title: "Ports",
      dataIndex: "Ports",
      key: "Ports",
      search: false,
      render: (_, record) => {
        if (!record.Ports || record.Ports.length === 0) return "N/A";
        return record.Ports.map((port, index) => {
          const { IP, PublicPort, PrivatePort } = port;
          const url = `http://${IP}:${PublicPort}`;
          return (
            <div key={index}>
              {PublicPort ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <FaExternalLinkAlt /> {`${PublicPort}:${PrivatePort}`}
                </a>
              ) : (
                "-"
              )}
            </div>
          );
        });
      },
    },
    {
      title: "Status",
      dataIndex: "State",
      key: "State",
      sorter: (a, b) => a.State - b.State,
      render: (_, record) => (
        <Space>
          <Tooltip title={record.Status}>
            <Badge status={statusBadgeMap[record.State] || "default"} />
          </Tooltip>
          <div>{record.Status}</div>
        </Space>
      ),
      filters: true,
      valueEnum: {
        [StatusEnum.Created]: { text: "Created", status: "default" },
        [StatusEnum.Running]: { text: "Running", status: "success" },
        [StatusEnum.Paused]: { text: "Paused", status: "warning" },
        [StatusEnum.Restarting]: { text: "Restarting", status: "processing" },
        [StatusEnum.Removing]: { text: "Removing", status: "default" },
        [StatusEnum.Exited]: { text: "Exited", status: "error" },
        [StatusEnum.Dead]: { text: "Dead", status: "error" },
      },
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <ProTable<Container>
        defaultSize="small"
        pagination={{
          showSizeChanger: true,
          pageSize: 10,
      }}
        columns={columns}
        dataSource={containers.filter(
          (container) =>
            container.Names.some((name) =>
              name.toLowerCase().includes(searchTerm.toLowerCase())
            ) ||
            container.Image.toLowerCase().includes(searchTerm.toLowerCase()) ||
            container.Id.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        loading={loading}
        options={{
          reload: () => fetchContainers(),
          setting: {
            draggable: true,
          },
        }}
        rowKey="Id"
        search={false}
        dateFormatter="string"
        toolBarRender={() => [
          <Input
            key="search"
            placeholder="Search By ID, Name or Image"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 210 }}
          />,
        ]}
        onChange={(_, filters) => {
          const selectedStatuses = filters.State as string[];
          
          if (selectedStatuses) {
            const mappedStatuses = selectedStatuses
              .map((num) => {
                return Object.keys(StatusEnum)
                  .filter((key) => isNaN(Number(key)))
                  .find((key) => StatusEnum[key as keyof typeof StatusEnum] === Number(num));
              })
              .filter(Boolean) as string[];

            setStatusFilters(mappedStatuses.map((s) => s.toLowerCase()));
          } else {
            setStatusFilters([]);
          }
        }}
      />

      {/* Drawer for Container Details */}
      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(null);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.Names && (
          <ProDescriptions<Container>
            column={2}
            title={currentRow?.Names[0].substring(1)}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.Id,
            }}
            columns={columns as ProDescriptionsItemProps<Container>[]}
          />
        )}
      </Drawer>
    </div>
  );
};

export default Containers;
