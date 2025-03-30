import { Row, Col, Card, Flex, Typography } from "antd";
import Title from "antd/es/typography/Title";
import { FaServer, FaLaptopCode, FaNetworkWired, FaLayerGroup, FaChartPie } from "react-icons/fa";
import { GrStorage } from "react-icons/gr";

const Dashboard = () => {
    return (
      <Row gutter={[16,16]}>
      <Col span={6}>
          <Card>
              <Flex align="center" gap={16}>
                  <div className="text-2xl flex items-center justify-center rounded-md h-12 w-12 bg-red-200 dark:bg-red-800">
                      <FaServer />
                  </div>
                  <div>
                      <Title level={4} style={{ marginBottom: 0 }}>
                          24
                      </Title>
                      <Typography>Containers</Typography>
                  </div>
              </Flex>
          </Card>
      </Col>
      <Col span={6}>
          <Card>
              <Flex align="center" gap={16}>
                  <div className="text-2xl flex items-center justify-center rounded-md h-12 w-12 bg-green-200 dark:bg-green-800">
                      <FaLaptopCode />
                  </div>
                  <div>
                      <Title level={4} style={{ marginBottom: 0 }}>
                          56
                      </Title>
                      <Typography>Images</Typography>
                  </div>
              </Flex>
          </Card>
      </Col>
      <Col span={6}>
          <Card>
              <Flex align="center" gap={16}>
                  <div className="text-2xl flex items-center justify-center rounded-md h-12 w-12 bg-yellow-200 dark:bg-yellow-800">
                      <GrStorage />
                  </div>
                  <div>
                      <Title level={4} style={{ marginBottom: 0 }}>
                          17
                      </Title>
                      <Typography>Volumes</Typography>
                  </div>
              </Flex>
          </Card>
      </Col>
      <Col span={6}>
          <Card>
              <Flex align="center" gap={16}>
                  <div className="text-2xl flex items-center justify-center rounded-md h-12 w-12 bg-blue-200  dark:bg-blue-800">
                      <FaNetworkWired />
                  </div>
                  <div>
                      <Title level={4} style={{ marginBottom: 0 }}>
                          3
                      </Title>
                      <Typography>Networks</Typography>
                  </div>
              </Flex>
          </Card>
      </Col>
      <Col span={6}>
          <Card>
              <Flex align="center" gap={16}>
                  <div className="text-2xl flex items-center justify-center rounded-md h-12 w-12 bg-lime-200  dark:bg-lime-800">
                      <FaLayerGroup />
                  </div>
                  <div>
                      <Title level={4} style={{ marginBottom: 0 }}>
                          3
                      </Title>
                      <Typography>Stack</Typography>
                  </div>
              </Flex>
          </Card>
      </Col>
      <Col span={6}>
          <Card>
              <Flex align="center" gap={16}>
                  <div className="text-2xl flex items-center justify-center rounded-md h-12 w-12 bg-blue-200 dark:bg-blue-800">
                      <FaChartPie />
                  </div>
                  <div>
                      <Title level={4} style={{ marginBottom: 0 }}>
                          3 GB
                      </Title>
                      <Typography>Storage</Typography>
                  </div>
              </Flex>
          </Card>
      </Col>
  </Row>
    );
  };
  
  export default Dashboard;
  