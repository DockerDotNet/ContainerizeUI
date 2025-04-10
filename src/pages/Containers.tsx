import AutoRefreshTable from "@/components/AutoRefreshTable";
import { statusBadgeMap, StatusEnum } from "@/enums/ContainerState";
import ContainersService from "@/services/containersService";
import {
  DeleteOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RedoOutlined,
  StopOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  ProColumns,
  ProDescriptions,
  ProDescriptionsItemProps,
} from "@ant-design/pro-components";
import { Badge, Button, Drawer, Dropdown, Input, notification, Space, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";

// Custom hook to get window width for responsive design
const useWindowWidth = () => {
  const [width, setWidth] = useState<number>(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
};

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

const ACTION_BUTTONS = [
  { key: "startContainer", label: "Start", icon: <PlayCircleOutlined /> },
  { key: "stopContainer", label: "Stop", icon: <StopOutlined /> },
  { key: "kill", label: "Force Kill", icon: <ThunderboltOutlined /> },
  { key: "restart", label: "Restart", icon: <RedoOutlined /> },
  { key: "pause", label: "Pause", icon: <PauseCircleOutlined /> },
  { key: "resume", label: "Resume", icon: <SyncOutlined /> },
  { key: "removeContainer", label: "Remove", icon: <DeleteOutlined /> },
];

const Containers = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<Container | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;

  // Using Outlet context for extra page content if provided
  // const { setPageExtra } = useOutletContext<{ setPageExtra?: (extra: React.ReactNode) => void }>() || {};

  // Fetch containers with applied filters
  const fetchContainers = useCallback(async () => {
    try {
      const filters: Record<string, any> = { all: true };
      if (statusFilters.length > 0) {
        filters["filters[status]"] = Object.fromEntries(
          statusFilters.map((status) => [status, true])
        );
      }
      const response = await ContainersService.listContainers(filters);
      setContainers(response.data);
    } catch (error) {
      console.error("Failed to fetch containers:", error);
      notification.error({
        message: "Fetch Error",
        description: "Failed to fetch containers. Please try again later.",
        placement: "topRight",
      });
    }
  }, [statusFilters]);

  useEffect(() => {
    fetchContainers();
  }, [statusFilters, fetchContainers]);

  // Handle container actions (start, stop, etc.)
  const handleAction = useCallback(
    async (action: string, label: string, containerIds: string[]) => {
      try {
        for (const id of containerIds) {
          // Dynamically call the action from the service
          await ContainersService[action](id);
        }
        notification.success({
          message: `${action.charAt(0).toUpperCase() + action.slice(1)} Successful`,
          description: `Containers have been ${label.toLowerCase()}ed successfully.`,
          placement: "topRight",
        });
        // Refresh container list after action
        setTimeout(fetchContainers, 300);
      } catch (error) {
        console.error(`Error executing ${action}:`, error);
        notification.error({
          message: `Failed to ${action}`,
          description: `An error occurred while trying to ${action} containers.`,
          placement: "topRight",
        });
      }
    },
    [fetchContainers]
  );

  // Define columns for the table
  const columns: ProColumns<Container>[] = [
    // Hide the ID column on mobile devices using the responsive property
    {
      title: "Container ID",
      dataIndex: "Id",
      key: "Id",
      copyable: true,
      ellipsis: true,
      width: 53,
      sorter: (a, b) => a.Id.localeCompare(b.Id),
      responsive: ["md"],
    },
    {
      title: "Name",
      dataIndex: "Names",
      key: "Names",
      width: 150,
      //ellipsis: true,
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
      width: 110,
      sorter: (a, b) => a.Image.localeCompare(b.Image),
    },
    {
      title: "Ports",
      dataIndex: "Ports",
      key: "Ports",
      search: false,
      width: 80,
      render: (_, record) => {
        if (!record.Ports || record.Ports.length === 0) return "N/A";
        return (
          <Space wrap>
            {record.Ports.map((port, index) => {
              const { IP, PublicPort, PrivatePort } = port;
              const url = `http://${IP}:${PublicPort}`;
              return (
                <div key={index}>
                  {PublicPort ? (
                    <a
                      href={url}
                      className="flex items-center space-x-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaExternalLinkAlt /> <span>{`${PublicPort}:${PrivatePort}`}</span>
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "State",
      key: "State",
      width: 150,
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

  // Memoize the filtered list of containers for performance
  const filteredContainers = useMemo(() => {
    return containers.filter((container) =>
      container.Names.some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      container.Image.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.Id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [containers, searchTerm]);

  // Handle filter changes coming from the table
  const handleTableChange = (_: any, filters: any) => {
    const selectedStatuses = filters.State as string[];
    if (selectedStatuses) {
      const mappedStatuses = selectedStatuses
        .map((num) =>
          Object.keys(StatusEnum)
            .filter((key) => isNaN(Number(key)))
            .find((key) => StatusEnum[key as keyof typeof StatusEnum] === Number(num))
        )
        .filter(Boolean) as string[];
      setStatusFilters(mappedStatuses.map((s) => s.toLowerCase()));
    } else {
      setStatusFilters([]);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <AutoRefreshTable<Container, Record<string, any>>
        defaultSize="small"
        pagination={{ showSizeChanger: true, defaultPageSize: 10 }}
        columns={columns}
        dataSource={filteredContainers}
        fetchData={fetchContainers}
        rowKey="Id"
        search={false}
        dateFormatter="string"
        options={{ fullScreen: true }}
        scroll={{ x: isMobile ? 600 : 800 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
          preserveSelectedRowKeys: true,
          alwaysShowAlert: true,
        }}
        tableAlertOptionRender={({ selectedRowKeys, onCleanSelected }) => {
          const hasSelection = selectedRowKeys.length > 0;

          const mobileActionMenu = (
            <Dropdown
              menu={{
                items: ACTION_BUTTONS.map(({ key, label, icon }) => ({
                  key,
                  label: (
                    <span onClick={() => handleAction(key, label, selectedRowKeys as string[])} className="flex items-center gap-2">
                      {icon} {label}
                    </span>
                  ),
                })),
              }}
              trigger={["click"]}
              disabled={!hasSelection}
            >
              <Button disabled={!hasSelection}>Actions</Button>
            </Dropdown>
          );

          return (
            <div style={{ display: "flex", gap: 8 }}>
              <Space wrap style={{ gap: 3 }}>
                {isMobile
                  ? mobileActionMenu
                  : ACTION_BUTTONS.map(({ key, label, icon }) => (
                    <Button
                      key={key}
                      icon={icon}
                      onClick={() => handleAction(key, label, selectedRowKeys as string[])}
                      disabled={!hasSelection}
                    >
                      {label}
                    </Button>
                  ))}
              </Space>
              <div>
                <Button
                  onClick={onCleanSelected}
                  disabled={!hasSelection}
                  type="link"
                  style={{ paddingLeft: isMobile ? 0 : undefined }}
                >
                  Clear
                </Button>
              </div>
            </div>
          );
        }}

        toolBarRender={() => [
          <Input
            key="search"
            placeholder="Search By ID, Name or Image"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: isMobile ? "100%" : 210 }}
          />,
        ]}
        onChange={(_, filters) => handleTableChange(_, filters)}
      />

      <Drawer
        width={isMobile ? "100%" : 600}
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
            request={async () => ({ data: currentRow || {} })}
            params={{ id: currentRow?.Id }}
            columns={columns as ProDescriptionsItemProps<Container>[]}
          />
        )}
      </Drawer>
    </div>
  );
};

export default Containers;
