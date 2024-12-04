import React from "react";
import { Card, Table, Container, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";

interface AdvertiserInfo {
  name: string;
  leader: string;
  rrn: string;
  phone: string;
  businessNum: string;
  address: string;
  type: string;
  item: string;
  email: string;
  userEmail: string;
}

interface Importance {
  monthSpending: number;
  degree: number;
}

interface Account {
  advertiser: AdvertiserInfo;
  importance: Importance;
  [key: string]: any;
}

const AccountList: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const tableExample: Account[] = [
    {
      advertiser: {
        name: "제이노블",
        leader: "김명찬",
        rrn: "99999-1111111",
        phone: "010-6789-6740",
        businessNum: "739-86-00096",
        address: "서울특별시 강남구 압구정로30길 9, 4층(신사동)",
        type: "서비스업",
        item: "결혼정보",
        email: "bricktop@naver.com",
        userEmail: "15-11991@mleverage.co.kr",
      },
      importance: { monthSpending: 60000000, degree: 5 },
    },
  ];

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title>계정 리스트</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table>
                <thead>
                  <tr>
                    <th>업체명</th>
                    <th>대표자명</th>
                    <th>연락처</th>
                    <th>사업자등록번호</th>
                  </tr>
                </thead>
                <tbody>
                  {tableExample.map((item, index) => (
                    <tr key={index}>
                      <td>{item.advertiser.name}</td>
                      <td>{item.advertiser.leader}</td>
                      <td>{item.advertiser.phone}</td>
                      <td>{item.advertiser.businessNum}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountList;
