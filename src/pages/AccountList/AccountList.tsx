import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "providers/authProvider";
import IAccount, {
  medaiAccount,
  payback,
} from "../../common/models/account/IAccount";
import dayjs from "dayjs";
import qs from "qs";
import "./AccountList.module.scss";

interface User {
  uid: string;
  role: string;
}

const AccountList: React.FC = () => {
  const [accountData, setAccountData] = useState<IAccount[]>([]);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [marketerList, setMarketerList] = useState<
    { uid: string; name: string }[]
  >([]);
  const [selectedMarketer, setSelectedMarketer] = useState<string>("");
  const { isLoggedIn } = useAuth();
  const [buttonState, setButtonState] = useState<"default" | "register">(
    "default"
  );
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedRow, setEditedRow] = useState<Partial<IAccount>>({}); // 행 수정 사항
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/user", {
        withCredentials: true,
      });
      const user: User = response.data.context.user;
      setUserRole(user.role);
      setUserId(user.uid);
      if (user.role === "admin" || user.role === "system") {
        const marketerResponse = response.data.body;
        const marketers = marketerResponse
          .filter((marketer: any) => marketer.departmentUuid === "3")
          .sort((a: any, b: any) => a.positionUuid - b.positionUuid)
          .map((marketer: any) => ({ uid: marketer.uid, name: marketer.name }));
        setMarketerList(marketers);
        if (marketerList.length >= 0 && !selectedMarketer) {
          setSelectedMarketer(marketers[0].uid);
        }
      }
    } catch (err) {
      console.error("로그인한 유저 정보 로드 실패:", err);
    }
  };

  const getAccounts = async () => {
    try {
      const response = await axios.get("/sheet/account");
      setAccountData(response.data.body);
      //203 에러 : 등록된 광고주 계정이 없습니다.
      if (response.status === 203) console.error(response.data.result.message);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };
  // getAccounts();

  //초기 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      await fetchUser();
      if (userRole && userId) {
        if (userRole === "user") {
          getAccounts();
        } else if (userRole === "admin" || userRole === "system") {
          // if (selectedMarketer) {
          getAccounts(); //selectedMarketer (부장님) 을 먼저 가져오기
          // }
        }
      }
    };
    initializeData();
  }, [isLoggedIn, selectedMarketer, userRole, userId]);

  if (userRole === null) {
    return <div>Loading...</div>; // 사용자 역할 로딩 중
  }

  const handleRegisterClick = async () => {
    try {
      // POST 요청에 사용할 데이터에서 임시 uuid 제거
      const { uuid, ...requestData } = editedRow; // uuid 제외
      console.log(requestData);
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
        // 서버에서 최신 데이터 동기화
        const refreshedData = await axios.get("/sheet/account");
        setAccountData(refreshedData.data.body);
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
      uuid: `temp-${Date.now()}`, // 임시 uuid
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
      transferDate: undefined,
      taxInvoiceInfo: "",
      payback: {
        naver: 0,
        kakao: 0,
        google: 0,
        carot: 0,
        etc: 0,
      },
      note: "",
      leaveDate: undefined,
      leaveReason: "",
      mediaAccount: {
        naver: { id: "", pwd: "", naverNumber: 0 },
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
    setSelectedRow(null);
    setEditingRow(null);
    setEditedRow({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof IAccount
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { value, type } = target;

    setEditedRow((prev) => ({
      ...prev,
      [field]:
        type === "checkbox" ? (target as HTMLInputElement).checked : value, // 체크박스와 일반 값 처리
    }));
  };

  type MediaAccountField =
    | "id"
    | "pwd"
    | "naverNumber"
    | "gfaNumber"
    | "kakaoNumber"
    | "momentNumber";

  const handleNestedFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    category: "mediaAccount" | "payback",
    subField: keyof medaiAccount | keyof payback,
    nestedField?: MediaAccountField
  ) => {
    const { value } = e.target;

    setEditedRow((prev) => {
      const updatedRow = { ...prev };

      if (category === "mediaAccount" && nestedField) {
        // mediaAccount 필드 처리
        updatedRow.mediaAccount = {
          ...updatedRow.mediaAccount,
          [subField as keyof medaiAccount]: {
            ...(updatedRow.mediaAccount?.[subField as keyof medaiAccount] ||
              {}),
            [nestedField]: value,
          },
        };
      } else if (category === "payback") {
        // payback 필드 처리
        updatedRow.payback = {
          ...updatedRow.payback,
          [subField as keyof payback]: parseFloat(value) || 0, // 숫자 변환
        };
      }

      return updatedRow;
    });
  };

  // 체크박스 체크 여부
  const handleCheckboxChange = (uuid: string) => {
    setSelectedRow((prev) => (prev === uuid ? null : uuid)); // 선택된 행 토글
    if (selectedRow === uuid) {
      setEditingRow(null);
      setEditedRow({});
    } else {
      setEditingRow(uuid);
      const rowData = accountData.find((row) => row.uuid === uuid);
      setEditedRow(rowData || {});
    }
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
  const handleSaveClick = async () => {
    if (!editingRow) return;

    if (window.confirm("저장하시겠습니까?")) {
      try {
        const originalRow = accountData.find((row) => row.uuid === editingRow);
        if (!originalRow) {
          alert("수정할 데이터를 찾을 수 없습니다.");
          return;
        }

        // 달라진 데이터 추출
        const updatedParams = Object.entries(editedRow).reduce(
          (acc: any, [key, value]) => {
            const originalValue = originalRow[key as keyof IAccount];

            // 최상위 필드 비교
            if (
              (typeof originalValue !== "object" || originalValue === null) &&
              originalValue !== value
            ) {
              acc[key as keyof IAccount] = value;
            }

            // 중첩 객체(mediaAccount, payback 등) 비교
            if (typeof originalValue === "object" && originalValue !== null) {
              const nestedUpdates = Object.entries(value || {}).reduce(
                (nestedAcc, [nestedKey, nestedValue]) => {
                  const nestedOriginalValue =
                    originalValue[nestedKey as keyof typeof originalValue];
                  if (nestedOriginalValue !== nestedValue) {
                    nestedAcc[nestedKey] = nestedValue;
                  }
                  return nestedAcc;
                },
                {} as any
              );

              if (Object.keys(nestedUpdates).length > 0) {
                acc[key as keyof IAccount] = {
                  ...(originalValue as object),
                  ...nestedUpdates,
                };
              }
            }

            return acc;
          },
          {} as Partial<IAccount>
        );

        // 기존 값과 변경된 값을 병합
        const combinedParams = {
          ...originalRow,
          ...updatedParams,
        };

        // 값이 없는 항목 제거
        const finalParams = Object.entries(combinedParams).reduce(
          (acc: any, [key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              acc[key as keyof IAccount] = value;
            }
            return acc;
          },
          {} as Partial<IAccount>
        );

        // 변경된 데이터가 없으면 종료
        if (Object.keys(finalParams).length === 0) {
          alert("수정된 내용이 없습니다.");
          return;
        }

        // API 요청
        const response = await axios.put(
          `/sheet/account/${editingRow}`,
          qs.stringify(finalParams),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        if (response.status === 200) {
          alert("사용자 정보가 수정되었습니다.");
          const updatedUser = response.data;

          // 상태 업데이트
          setAccountData((prevData) =>
            prevData.map((row) =>
              row.uuid === editingRow ? { ...row, ...updatedUser } : row
            )
          );

          // 서버에서 최신 데이터 가져오기
          const refreshedData = await axios.get("/sheet/account");
          setAccountData(refreshedData.data.body);

          // 상태 초기화
          setButtonState("default");
          setEditingRow(null);
          setEditedRow({});
          setSelectedRow(null);
        }
      } catch (error) {
        console.error("저장 실패:", error);
        alert("저장 중 문제가 발생했습니다.");
      }
    }
  };

  // 마케터 필터 변경 처리
  const handleMarketerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const marketerUid = e.target.value;
    setSelectedMarketer(marketerUid);
    getAccounts(); // 적용된 데이터 가져오기(marketerUid로 )
  };

  return (
    <div className="container-fluid">
      <div className="mb-2 d-flex justify-content-between">
        {/* 필터 */}
        <div>
          {(userRole == "system" || userRole == "admin") && (
            <>
              <label className="mr-2">이름:</label>
              <select
                className="mr-2"
                value={selectedMarketer}
                onChange={handleMarketerChange}
              >
                {marketerList.map((marketer: any, index) => (
                  <option
                    key={marketer.uid}
                    value={marketer.uid}
                    selected={index === 0}
                  >
                    {marketer.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
        <div className="d-flex justify-content-end mb-3">
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

      <div className="table-full-width px-0 table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr className="text-nowrap text-center">
              <th colSpan={1}></th>
              <th colSpan={12}>광고주 정보</th>
              <th colSpan={2}>중요도</th>
              <th colSpan={8}>관리 정보</th>
              <th colSpan={2}>이탈시</th>
              <th colSpan={1}>홈페이지</th>
              <th colSpan={3} style={{ backgroundColor: "#6aa84f" }}>
                네이버
              </th>
              <th colSpan={3} style={{ backgroundColor: "#38761d" }}>
                네이버 GFA
              </th>
              <th colSpan={4} style={{ backgroundColor: "#bf9000" }}>
                카카오/카카오 모먼트
              </th>
              <th colSpan={2} style={{ backgroundColor: "#3c78d8" }}>
                구글
              </th>
              <th colSpan={2} style={{ backgroundColor: "#e69138" }}>
                당근
              </th>
              <th colSpan={2}>기타</th>
              <th colSpan={2}>사수/부사수</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-nowrap text-center">
              <td rowSpan={2}>선택</td>
              <td rowSpan={2}>업체명</td>
              <td rowSpan={2}>대표자명</td>
              <td rowSpan={2}>주민등록번호(신분증)</td>
              <td rowSpan={2}>담당자명(주 소통)</td>
              <td rowSpan={2}>연락처(담당자)</td>
              <td rowSpan={2}>사업자등록증(업체명)</td>
              <td rowSpan={2}>사업자등록번호</td>
              <td rowSpan={2}>사업장주소</td>
              <td rowSpan={2}>업태</td>
              <td rowSpan={2}>종목</td>
              <td rowSpan={2}>업체 이메일</td>
              <td rowSpan={2}>마케팅레버리지 담당자 이메일</td>
              <td rowSpan={2}>월 스펜딩(10단위)</td>
              <td rowSpan={2}>점수: 1~5</td>
              <td rowSpan={2}>이관일자</td>
              <td rowSpan={2}>세금계산서 발행정보</td>
              <td colSpan={5}>페이백(요율%)</td>
              <td rowSpan={2}>비고</td>
              <td rowSpan={2}>피이관일자</td>
              <td rowSpan={2}>사유</td>
              <th rowSpan={2}></th>
              <td rowSpan={2}>아이디</td>
              <td rowSpan={2}>비밀번호</td>
              <td rowSpan={2}>광고계정번호</td>
              <td rowSpan={2}>아이디</td>
              <td rowSpan={2}>비밀번호</td>
              <td rowSpan={2}>광고계정번호</td>
              <td rowSpan={2}>아이디</td>
              <td rowSpan={2}>비밀번호</td>
              <td rowSpan={2}>카카오번호</td>
              <td rowSpan={2}>모먼트번호</td>
              <td rowSpan={2}>아이디</td>
              <td rowSpan={2}>비밀번호</td>
              <td rowSpan={2}>아이디</td>
              <td rowSpan={2}>비밀번호</td>
              <td rowSpan={2}>아이디</td>
              <td rowSpan={2}>비밀번호</td>
              <td rowSpan={2}>멘토 유무</td>
              <td rowSpan={2}>멘토</td>
            </tr>
            <tr className="text-nowrap text-center">
              <td>네이버</td>
              <td>카카오</td>
              <td>구글</td>
              <td>당근</td>
              <td>기타</td>
            </tr>
            {accountData &&
              accountData.map((row) => (
                <tr
                  key={row.uuid}
                  className="text-nowrap"
                  style={{
                    backgroundColor:
                      editingRow === row.uuid ? "#f0f8ff" : "transparent", // 선택 시 강조
                  }}
                >
                  <td className="text-center">
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
                          value={editedRow.payback?.naver || 0}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "payback", "naver")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editedRow.payback?.kakao || 0}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "payback", "kakao")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editedRow.payback?.google || 0}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "payback", "google")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editedRow.payback?.carot || 0}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "payback", "carot")
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editedRow.payback?.etc || 0}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "payback", "etc")
                          }
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
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "naver",
                              "id"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.naver?.pwd || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "naver",
                              "pwd"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={
                            editedRow.mediaAccount?.naver?.naverNumber || ""
                          }
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "naver",
                              "naverNumber"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.gfa?.id || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "gfa",
                              "id"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.gfa?.pwd || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "gfa",
                              "pwd"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.gfa?.gfaNumber || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "gfa",
                              "gfaNumber"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.kakao?.id || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "kakao",
                              "id"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.kakao?.pwd || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "kakao",
                              "pwd"
                            )
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
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "kakao",
                              "kakaoNumber"
                            )
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
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "kakao",
                              "momentNumber"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.google?.id || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "google",
                              "id"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.google?.pwd || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "google",
                              "pwd"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.carot?.id || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "carot",
                              "id"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.carot?.pwd || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "carot",
                              "pwd"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.etc?.id || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "etc",
                              "id"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mediaAccount?.etc?.pwd || ""}
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "mediaAccount",
                              "etc",
                              "pwd"
                            )
                          }
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={editedRow.isAssisted || false}
                          onChange={(e) => handleChange(e, "isAssisted")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.mentor || ""}
                          onChange={(e) => handleChange(e, "mentor")}
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
                      <td>
                        {row.transferDate
                          ? dayjs(row.transferDate).format("YYYY-MM-DD")
                          : ""}
                      </td>
                      <td>{row.taxInvoiceInfo}</td>
                      <td>{row.payback?.naver}</td>
                      <td>{row.payback?.kakao}</td>
                      <td>{row.payback?.google}</td>
                      <td>{row.payback?.carot}</td>
                      <td>{row.payback?.etc}</td>
                      <td>{row.note}</td>
                      <td>
                        {row.leaveDate
                          ? dayjs(row.leaveDate).format("YYYY-MM-DD")
                          : ""}
                      </td>
                      <td>{row.leaveReason}</td>
                      <td></td> {/* 홈페이지 자리 */}
                      <td>{row.mediaAccount?.naver?.id}</td>
                      <td>{row.mediaAccount?.naver?.pwd}</td>
                      <td>{row.mediaAccount?.naver?.naverNumber}</td>
                      <td>{row.mediaAccount?.gfa?.id}</td>
                      <td>{row.mediaAccount?.gfa?.pwd}</td>
                      <td>{row.mediaAccount?.gfa?.gfaNumber}</td>
                      <td>{row.mediaAccount?.kakao?.id}</td>
                      <td>{row.mediaAccount?.kakao?.pwd}</td>
                      <td>{row.mediaAccount?.kakao?.kakaoNumber}</td>
                      <td>{row.mediaAccount?.kakao?.momentNumber}</td>
                      <td>{row.mediaAccount?.google?.id}</td>
                      <td>{row.mediaAccount?.google?.pwd}</td>
                      <td>{row.mediaAccount?.carot?.id}</td>
                      <td>{row.mediaAccount?.carot?.pwd}</td>
                      <td>{row.mediaAccount?.etc?.id}</td>
                      <td>{row.mediaAccount?.etc?.pwd}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          disabled
                          checked={row.isAssisted}
                        />
                      </td>
                      <td>
                        {marketerList.find(
                          (user: any) => user.uid === row.mentor
                        )?.name || ""}
                      </td>
                    </>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountList;
