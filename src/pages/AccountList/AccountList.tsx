import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "providers/authProvider";
import IAccount, { medaiAccount } from "../../common/models/account/IAccount";
import dayjs from "dayjs";

interface User {
  uid: string;
  role: string;
}

const AccountList: React.FC = () => {
  const [accountData, setAccountData] = useState<IAccount[]>([]);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const [buttonState, setButtonState] = useState<"default" | "register">(
    "default"
  );
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedRow, setEditedRow] = useState<Partial<IAccount>>({}); // 행 수정 사항
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

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
        // console.log(response.data.body);
        //203 에러 : 등록된 광고주 계정이 없습니다.
        if (response.data.result.code == 203)
          console.log(response.data.result.message);
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

  const handleRegisterClick = async () => {
    try {
      // POST 요청에 사용할 데이터에서 임시 uuid 제거
      const { uuid, ...requestData } = editedRow; // uuid 제외
      const response = await axios.post("/sheet/account", requestData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      if (response.status === 200) {
        alert("새로운 계정이 등록되었습니다.");
        const addedAccount = response.data; // 서버에서 반환된 데이터
        // 상태 업데이트: 임시 UUID를 서버의 데이터로 대체
        setAccountData((prevData) =>
          prevData.map((row) =>
            row.uuid === editingRow ? { ...row, ...addedAccount } : row
          )
        );
        // 상태 초기화
        setEditingRow(null);
        setEditedRow({});
        setButtonState("default");
      } else {
        alert("등록 중 문제가 발생했습니다.");
      }
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 중 문제가 발생했습니다.");
    }
  };

  const handleAddNew = () => {
    // 새로운 행의 데이터 초기화
    const newAccount: Partial<IAccount> = {
      uuid: `temp-${Date.now()}`,
      companyName: "",
      advertiserName: "",
      residentNumber: "",
      managerName: "",
      phone: "",
      businessReg: "",
      businessNumber: "",
      businessAddress: "",
      businessType1: "",
      businessType2: "",
      companyEmail: "",
      marketerEmail: "",
      spending: 0,
      point: 0,
      transferDate: new Date(),
      taxInvoiceInfo: "",
      payback: 0,
      note: "",
      leaveDate: new Date(),
      leaveReason: "",
      mediaAccount: {
        naver: { id: "", pwd: "" },
        gfa: { id: "", pwd: "", gfaNumber: 0 },
        kakao: { id: "", pwd: "", kakaoNumber: 0, momentNumber: 0 },
        google: { id: "", pwd: "" },
        etc: { id: "", pwd: "" },
      },
    };
    // 상태 업데이트
    setAccountData((prevData: any) => [...prevData, newAccount]);
    setEditingRow(newAccount.uuid || ""); // 새 행을 편집 모드로 설정
    setEditedRow(newAccount); // 수정 상태로 초기화
    setButtonState("register");
  };

  const handleCancelClick = () => {
    setAccountData((prev) =>
      editingRow?.startsWith("temp-")
        ? prev.filter((row) => row.uuid !== editingRow) // 임시 행만 삭제
        : prev
    );
    setButtonState("default");
    setEditingRow(null);
    setEditedRow({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof IAccount
  ) => {
    setEditedRow((prev) => ({ ...prev, [field]: e.target.value }));
    console.log("field:", field, "value:", editedRow[field]);
  };

  const handleNestedFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    platform: keyof medaiAccount,
    subField: string
  ) => {
    const { value } = e.target;

    setEditedRow((prev) => {
      const updatedRow = { ...prev };

      // 중첩 필드 처리
      updatedRow.mediaAccount = {
        ...updatedRow.mediaAccount,
        [platform]: {
          ...(updatedRow.mediaAccount?.[platform] || {}),
          [subField]: value,
        },
      };

      return updatedRow;
    });
    console.log("platform:", platform, "value:", editedRow.mediaAccount);
  };

  // 수정할 데이터행 클릭
  const handleRowClick = (uuid: string) => {
    setEditingRow(uuid); // 수정 중인 행 설정
    const rowToEdit = accountData.find((row) => row.uuid === uuid);
    setEditedRow((prev) => ({ ...prev, ...rowToEdit })); // 해당 행 데이터 설정
    console.log(rowToEdit);
  };

  // 체크박스 체크 여부
  const handleCheckboxChange = (uuid: string) => {
    setSelectedRow((prev) => (prev === uuid ? null : uuid)); // 선택된 행 토글
  };

  // 데이터행 삭제
  const handleDeleteClick = async () => {
    if (!selectedRow) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }
    // 삭제 재확인
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        // DELETE 요청
        await axios.delete(`/sheet/account/${selectedRow}`, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        alert("선택한 계정이 삭제되었습니다.");
        // 상태에서 삭제된 행 제거
        setAccountData((prevData) =>
          prevData.filter((row) => row.uuid !== selectedRow)
        );
        // 선택 상태 초기화
        setSelectedRow(null);
      } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제 중 문제가 발생했습니다.");
      }
    }
  };

  //데이터행 수정저장
  const handleSaveClick = async () => {};

  return (
    <div className="container-fluid">
      <div className="mb-2 d-flex justify-content-between">
        <div>
          <button className="mr-2 btn btn-outline-secondary">마케터1</button>
          <button className="mr-2 btn btn-outline-secondary">마케터2</button>
        </div>
        <div className="d-flex justify-content-end mb-2">
          {editingRow || selectedRow ? (
            <>
              {editingRow && buttonState !== "register" && (
                <>
                  <button
                    className="btn btn-primary mr-2"
                    onClick={handleSaveClick}
                  >
                    저장
                  </button>
                  <button
                    className="btn btn-secondary mr-2"
                    onClick={handleCancelClick}
                  >
                    취소
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteClick}
                  >
                    삭제
                  </button>
                </>
              )}
            </>
          ) : null}
          {/* 등록 버튼 */}
          {buttonState === "default" ? (
            <button className="btn btn-success mx-2" onClick={handleAddNew}>
              추가
            </button>
          ) : (
            <>
              <button
                className="btn btn-success mx-2"
                onClick={handleRegisterClick}
              >
                등록
              </button>
              <button
                className="btn btn-secondary mr-2"
                onClick={handleCancelClick}
              >
                취소
              </button>
            </>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-body table-full-width px-0 table-responsive">
          <table className="table">
            <thead>
              <tr className="text-nowrap text-center">
                <th></th> {/* 선택 열 */}
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
                <th>선택</th>
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
              {accountData.map((row) => (
                <tr
                  key={row.uuid}
                  className="text-nowrap"
                  onClick={() => handleRowClick(row.uuid)} // 행 클릭 시 수정 모드로 전환
                  style={{
                    backgroundColor:
                      editingRow === row.uuid || selectedRow === row.uuid
                        ? "#f0f8ff"
                        : "transparent", // 선택 시 강조
                  }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRow === row.uuid} // 선택 여부 확인
                      disabled={buttonState === "register"} // 추가 상태에서는 체크박스
                      onChange={() => handleCheckboxChange(row.uuid)} // 체크박스 선택 처리
                    />
                  </td>
                  {editingRow === row.uuid ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={editedRow.companyName || ""}
                          onChange={(e) => handleChange(e, "companyName")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.advertiserName || ""}
                          onChange={(e) => handleChange(e, "advertiserName")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.residentNumber || ""}
                          onChange={(e) => handleChange(e, "residentNumber")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.managerName || ""}
                          onChange={(e) => handleChange(e, "managerName")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.phone || ""}
                          onChange={(e) => handleChange(e, "phone")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.businessReg || ""}
                          onChange={(e) => handleChange(e, "businessReg")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.businessNumber || ""}
                          onChange={(e) => handleChange(e, "businessNumber")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.businessAddress || ""}
                          onChange={(e) => handleChange(e, "businessAddress")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.businessType1 || ""}
                          onChange={(e) => handleChange(e, "businessType1")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.businessType2 || ""}
                          onChange={(e) => handleChange(e, "businessType2")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.companyEmail || ""}
                          onChange={(e) => handleChange(e, "companyEmail")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.marketerEmail || ""}
                          onChange={(e) => handleChange(e, "marketerEmail")}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editedRow.spending || 0}
                          onChange={(e) => handleChange(e, "spending")}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editedRow.point || 0}
                          onChange={(e) => handleChange(e, "point")}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={
                            editedRow.transferDate
                              ? dayjs(editedRow.transferDate).format(
                                  "YYYY-MM-DD"
                                )
                              : ""
                          }
                          onChange={(e) => handleChange(e, "transferDate")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.taxInvoiceInfo || ""}
                          onChange={(e) => handleChange(e, "taxInvoiceInfo")}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editedRow.payback || 0}
                          onChange={(e) => handleChange(e, "payback")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.note || ""}
                          onChange={(e) => handleChange(e, "note")}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={
                            editedRow.leaveDate
                              ? dayjs(editedRow.leaveDate).format("YYYY-MM-DD")
                              : ""
                          }
                          onChange={(e) => handleChange(e, "leaveDate")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.leaveReason || ""}
                          onChange={(e) => handleChange(e, "leaveReason")}
                        />
                      </td>
                      <td></td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.naver?.id || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "naver", "id")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.naver?.pwd || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "naver", "pwd")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.gfa?.id || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "gfa", "id")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.gfa?.pwd || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "gfa", "pwd")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.gfa?.gfaNumber || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "gfa", "gfaNumber")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.kakao?.id || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "kakao", "id")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.kakao?.pwd || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "kakao", "pwd")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={
                            editedRow.mediaAccount?.kakao?.kakaoNumber || ""
                          }
                          onChange={(e) =>
                            handleNestedFieldChange(e, "kakao", "kakaoNumber")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={
                            editedRow.mediaAccount?.kakao?.momentNumber || ""
                          }
                          onChange={(e) =>
                            handleNestedFieldChange(e, "kakao", "momnetNumber")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.google?.id || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "google", "id")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.google?.pwd || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "google", "pwd")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.etc?.id || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "etc", "id")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.etc?.pwd || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "etc", "pwd")
                          }
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{row?.companyName}</td>
                      <td>{row.advertiserName}</td>
                      <td>{row.residentNumber}</td>
                      <td>{row.managerName}</td>
                      <td>{row.phone}</td>
                      <td>{row.businessReg}</td>
                      <td>{row.businessNumber}</td>
                      <td>{row.businessAddress}</td>
                      <td>{row.businessType1}</td>
                      <td>{row.businessType2}</td>
                      <td>{row.companyEmail}</td>
                      <td>{row.marketerEmail}</td>
                      <td>{row.spending}</td>
                      <td>{row.point}</td>
                      <td>{dayjs(row.transferDate).format("YYYY-MM-DD")}</td>
                      <td>{row.taxInvoiceInfo}</td>
                      <td>{row.payback}</td>
                      <td>{row.note}</td>
                      <td>{dayjs(row.leaveDate).format("YYYY-MM-DD")}</td>
                      <td>{row.leaveReason}</td>
                      <td></td> {/* 홈페이지 자리 */}
                      <td>{row.mediaAccount?.naver?.id}</td>
                      <td>{row.mediaAccount?.naver?.pwd}</td>
                      <td>{row.mediaAccount?.gfa?.id}</td>
                      <td>{row.mediaAccount?.gfa?.pwd}</td>
                      <td>{row.mediaAccount?.gfa?.gfaNumber}</td>
                      <td>{row.mediaAccount?.kakao?.id}</td>
                      <td>{row.mediaAccount?.kakao?.pwd}</td>
                      <td>{row.mediaAccount?.kakao?.kakaoNumber}</td>
                      <td>{row.mediaAccount?.kakao?.momentNumber}</td>
                      <td>{row.mediaAccount?.google?.id}</td>
                      <td>{row.mediaAccount?.google?.pwd}</td>
                      <td>{row.mediaAccount?.etc?.id}</td>
                      <td>{row.mediaAccount?.etc?.pwd}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountList;
