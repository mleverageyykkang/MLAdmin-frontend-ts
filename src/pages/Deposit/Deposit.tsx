import React, { useEffect, useState } from "react";
import { Card, Table, Container, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "providers/authProvider";
// import IDeposit, { paymentType } from "../../common/models/deposit/IDeposit";

interface User {
  uid: string;
  role: string;
}

const Deposit: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  //   const [depositData, setDepositData] = useState<IAccount[]>([]);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const [error, setError] = useState<string | null>();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get("/sheet/deposit", {
          withCredentials: true,
        });
        const user: User = response.data.context.user;
        setUserRole(user.role);
      } catch (err) {
        console.error("Error fetching user role:", err);
        alert("권한이 없습니다.");
        navigate("/");
      }
    };
    fetchUserRole();
  }, [isLoggedIn]);
  useEffect(() => {
    const getAccounts = async () => {
      try {
        const response = await axios.get("/sheet/account");
        console.log(response.data.body);
      } catch (error) {
        console.log("Failed to fetch data:", error);
      }
    };
    getAccounts();
  }, []);

  if (userRole === null) {
    return <div>Loading...</div>; // 사용자 역할 로딩 중
  }

  if (userRole !== "system") {
    return <div>접근 권한이 없습니다.</div>; // 권한 없는 사용자
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body table-full-width px-0 table-responsive">
          <table className="table">
            <thead>
              <tr className="text-nowrap">
                {/* 광고주 정보 */}
                <th>진행일자</th>
                <th>업체명</th>
                <th>입금자명</th>
                <th>입금일자</th>
                <th>세금계산서 발행</th>
                <th>입금금액</th>
                <th>회사처리유무</th>
                <th>결제방식</th>
                <th>충전 후 잔액</th>
              </tr>
            </thead>
            <tbody>
              {/* {accountData &&
                accountData.map((row) => ( */}
              <tr className="text-nowrap">
                {/* 광고주 정보 */}
                {/* <td>{row.companyName}</td> */}
              </tr>
              {/* ))} */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
