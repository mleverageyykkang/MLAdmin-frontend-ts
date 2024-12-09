import React, { useEffect, useState } from "react";
import { Card, Table, Container, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "src/providers/authProvider";
import IAccount, { medaiAccount } from "../../common/models/account/IAccount";

const API_URL = "http://localhost:20220";

interface User {
  uid: string;
  role: string;
}

const AccountList: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const [accountData, setAccountData] = useState<IAccount[]>([]);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get("/sheet/account", {
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
        setAccountData(response.data.body);
      } catch (error) {
        console.log("Failed to fetch data:", error);
      }
    };
    getAccounts();
  }, [accountData]);

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
                <th colSpan={12}>광고주 정보</th>
                <th colSpan={2}>중요도</th>
                <th colSpan={4}>관리 정보</th>
                <th colSpan={2}>이탈시</th>
                <th colSpan={1}>홈페이지</th>
                <th colSpan={2}>네이버</th>
                <th colSpan={3}>네이버 GFA</th>
                <th colSpan={4}>카카오/카카오 모먼트</th>
                <th colSpan={2}>구글</th>
                <th colSpan={2}>기타</th>
              </tr>
              <tr className="text-nowrap">
                {/* 광고주 정보 */}
                <th>업체명</th>
                <th>대표자명</th>
                <th>주민등록번호(신분증)</th>
                <th>담당자명(주 소통)</th>
                <th>연락처(담당자)</th>
                <th>사업자등록증(업체명)</th>
                <th>사업자등록번호</th>
                <th>사업장주소</th>
                <th>업태</th>
                <th>종목</th>
                <th>업체 이메일</th>
                <th>마케팅레버리지 담당자 이메일</th>
                {/* 중요도 */}
                <th>월 스펜딩(10단위)</th>
                <th>점수: 1~5</th>
                {/* 관리정보 */}
                <th>이관일자</th>
                <th>세금계산서 발행정보</th>
                <th>페이백(요율%)</th>
                <th>비고</th>
                {/* 이탈 시 */}
                <th>피이관일자</th>
                <th>사유</th>
                {/* 홈페이지 */}
                <th></th>
                {/* 네이버 */}
                <th>아이디</th>
                <th>비밀번호</th>
                <th>아이디</th>
                <th>비밀번호</th>
                <th>광고계정번호</th>
                <th>아이디</th>
                <th>비밀번호</th>
                <th>카카오번호</th>
                <th>모먼트번호</th>
                <th>아이디</th>
                <th>비밀번호</th>
                <th>아이디</th>
                <th>비밀번호</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-nowrap">
                {/* 광고주 정보 */}
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountList;
