import React from "react";
// import ChartistGraph from "react-chartist";
import { Card, Container, Row, Col } from "react-bootstrap";

function Dashboard() {
  // Chart data and options types
  interface ChartData {
    labels: string[];
    series: number[][];
  }

  interface ChartOptions {
    low?: number;
    high?: number;
    showArea?: boolean;
    height?: string;
    axisX?: { showGrid?: boolean };
    lineSmooth?: boolean;
    showLine?: boolean;
    showPoint?: boolean;
    fullWidth?: boolean;
    chartPadding?: { right: number };
    seriesBarDistance?: number;
  }

  interface ResponsiveOption {
    [key: string]: any;
  }

  const chartHoursData: ChartData = {
    labels: [
      "9:00AM",
      "12:00AM",
      "3:00PM",
      "6:00PM",
      "9:00PM",
      "12:00PM",
      "3:00AM",
      "6:00AM",
    ],
    series: [
      [287, 385, 490, 492, 554, 586, 698, 695],
      [67, 152, 143, 240, 287, 335, 435, 437],
      [23, 113, 67, 108, 190, 239, 307, 308],
    ],
  };

  const chartHoursOptions: ChartOptions = {
    low: 0,
    high: 800,
    showArea: false,
    height: "245px",
    axisX: {
      showGrid: false,
    },
    lineSmooth: true,
    showLine: true,
    showPoint: true,
    fullWidth: true,
    chartPadding: {
      right: 50,
    },
  };

  const chartPreferencesData = {
    labels: ["40%", "20%", "40%"],
    series: [40, 20, 40],
  };

  const chartActivityData: ChartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mai",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    series: [
      [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895],
      [412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695],
    ],
  };

  const chartActivityOptions: ChartOptions = {
    seriesBarDistance: 10,
    axisX: {
      showGrid: false,
    },
    height: "245px",
  };

  const responsiveOptions: ResponsiveOption[] = [
    [
      "screen and (max-width: 640px)",
      {
        seriesBarDistance: 5,
        axisX: {
          labelInterpolationFnc: (value: string) => value[0],
        },
      },
    ],
  ];

  return (
    <div>
      <Container fluid>
        <Row>
          <Col lg="3" sm="6">
            {/* <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-chart text-warning"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Number</p>
                      <Card.Title as="h4">150GB</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-redo mr-1"></i>
                  Update Now
                </div>
              </Card.Footer>
            </Card> */}
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Users Behavior</Card.Title>
                <p className="card-category">24 Hours performance</p>
              </Card.Header>
              {/* <Card.Body>
                <div className="ct-chart" id="chartHours">
                  <ChartistGraph
                    data={chartHoursData}
                    type="Line"
                    options={chartHoursOptions}
                    responsiveOptions={responsiveOptions}
                  />
                </div>
              </Card.Body> */}
              <Card.Footer>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i> Open{" "}
                  <i className="fas fa-circle text-danger"></i> Click{" "}
                  <i className="fas fa-circle text-warning"></i> Click Second
                  Time
                </div>
                <hr />
                <div className="stats">
                  <i className="fas fa-history"></i> Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col md="6">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Email Statistics</Card.Title>
                <p className="card-category">Last Campaign Performance</p>
              </Card.Header>
              <Card.Body>
                <div
                  className="ct-chart ct-perfect-fourth"
                  id="chartPreferences"
                >
                  {/* <ChartistGraph data={chartPreferencesData} type="Pie" /> */}
                </div>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i> Open{" "}
                  <i className="fas fa-circle text-danger"></i> Bounce{" "}
                  <i className="fas fa-circle text-warning"></i> Unsubscribe
                </div>
                <hr />
                <div className="stats">
                  <i className="far fa-clock"></i> Campaign sent 2 days ago
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <div></div>
    </div>
  );
}

export default Dashboard;
