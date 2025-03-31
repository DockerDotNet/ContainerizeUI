import AutoRefreshTable from "@/components/AutoRefreshTable";
import { statusBadgeMap, StatusEnum } from "@/enums/ContainerState";
import ContainersService from "@/services/containersService";
import { DeleteOutlined, PauseCircleOutlined, PlayCircleOutlined, RedoOutlined, StopOutlined, SyncOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { ProColumns, ProDescriptions, ProDescriptionsItemProps } from "@ant-design/pro-components";
import { Badge, Button, Drawer, Input, message, notification, Space, Tooltip } from "antd";
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

const actionButtons = [
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
  const { setPageExtra } = useOutletContext<{
    setPageExtra?: (extra: React.ReactNode) => void;
  }>() || {};

  const fetchContainers = async () => {
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
    }
  };

  useEffect(() => {
    fetchContainers();
  }, [statusFilters]);

  const handleAction = async (action: string,lable: string, containerIds: string[]) => {
    try {
      for (const id of containerIds) {
        await ContainersService[action](id);
      }
      notification.success({
        message: `${action.charAt(0).toUpperCase() + action.slice(1)} Successful`,
        description: `Containers have been ${lable}ed successfully.`,
        placement: "topRight",
      });
      setTimeout(() => {
        fetchContainers();
      },300);
    } catch (error) {
      notification.error({
        message: `Failed to ${action}`,
        description: `An error occurred while trying to ${action} containers.`,
        placement: "topRight",
      });
    }
  };

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
        return <div className="flex space-x-3">
          {record.Ports.map((port, index) => {
          const { IP, PublicPort, PrivatePort } = port;
          const url = `http://${IP}:${PublicPort}`;
          return (
            <div key={index}>
              {PublicPort ? (
                <a href={url}  className="flex items-center space-x-2" target="_blank" rel="noopener noreferrer">
                  <FaExternalLinkAlt /> <span>{`${PublicPort}:${PrivatePort}`}</span> 
                </a>
              ) : (
                "-"
              )}
            </div>
          );
        })}
        </div> 
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

  const filteredContainers = containers.filter(
    (container) =>
      container.Names.some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      container.Image.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.Id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>
      <AutoRefreshTable<Container, Record<string, any>>
        defaultSize="small"
        pagination={{ showSizeChanger: true, defaultPageSize: 10 }}
        columns={columns}
        dataSource={filteredContainers}
        fetchData={fetchContainers}
        setPageExtra={setPageExtra}
        rowKey="Id"
        search={false}
        dateFormatter="string"
        options={{
          fullScreen: true,
        }}
        
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
          preserveSelectedRowKeys: true,
          alwaysShowAlert: true,

        }}
        
        tableAlertOptionRender={({ selectedRowKeys, onCleanSelected }) => (
          <Space>
            {actionButtons.map(({ key, label, icon }) => (
                <Button
                  key={key}
                  icon={icon}
                  onClick={() => handleAction(key,label, selectedRowKeys as string[])}
                  disabled={selectedRowKeys.length === 0}
                >
                  {label}
                </Button>
              ))}
            <Button onClick={onCleanSelected} disabled={selectedRowKeys.length === 0} type="link">
              Clear
            </Button>
          </Space>
        )}
        toolBarRender={() => [
          <Input
            key="search"
            placeholder="Search By ID, Name or Image"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 210 }}
          />
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
