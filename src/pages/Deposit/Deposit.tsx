import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "providers/authProvider";
import dayjs from "dayjs";
import IDeposit, {
  paymentType,
  processType,
} from "../../common/models/deposit/IDeposit";

interface User {
  uid: string;
  role: string;
}

const Deposit: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const [depositData, setDepositData] = useState<IDeposit[]>([]);
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
        const response = await axios.get("/sheet/deposit");
        console.log(response.data.body);
        setDepositData(response.data.body);
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
                <th>충전 가능 금액</th>
                <th>네이버</th>
                <th>네이버GFA</th>
                <th>카카오</th>
                <th>카카오모먼트</th>
                <th>구글</th>
                <th>당근</th>
                <th>네이버NOSP</th>
                <th>메타</th>
                <th>데이블</th>
                <th>송금/결제</th>
                <th>순매출</th>
              </tr>
            </thead>
            <tbody>
              {depositData &&
                depositData.map((row) => (
                  <tr className="text-nowrap">
                    {/* 광고주 정보 */}
                    <td>{dayjs(row.progressDate).format("YYYY-MM-DD")}</td>
                    <td>{row.company}</td>
                    <td>{row.depositor}</td>
                    <td>{dayjs(row.depositDate).format("YYYY-MM-DD")}</td>
                    <td>{row.taxInvoice}</td>
                    <td>{Number(row.depositAmount)}</td>
                    <td>{row.paymentType}</td>
                    <td>{row.processType}</td>
                    <td>{row.rechargeableAmount}</td>
                    {/* <td>{Number(row.deductAmount)}</td> */}
                    {/* <td>{dayjs(row.depositDueDate).format("YYYY-MM-DD")}</td> */}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
