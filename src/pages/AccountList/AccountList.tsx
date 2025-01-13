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
import AccountStyles from "./AccountList.module.scss";

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
   const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(
     null
   );
  const [columns, setColumns] = useState<
    Array<{ id: string; label: string; group: string; accessor: string }>
  >([
    {
      id: "companyName",
      label: "업체명",
      group: "advertiser",
      accessor: "companyName",
    },
    {
      id: "advertiserName",
      label: "대표자명",
      group: "advertiser",
      accessor: "advertiserName",
    },
    {
      id: "residentNumber",
      label: "주민등록번호(신분증)",
      group: "advertiser",
      accessor: "residentNumber",
    },
    {
      id: "managerName",
      label: "담당자명",
      group: "advertiser",
      accessor: "managerName",
    },
    {
      id: "phone",
      label: "연락처(담당자)",
      group: "advertiser",
      accessor: "phone",
    },
    {
      id: "businessReg",
      label: "사업자등록증(업체명)",
      group: "advertiser",
      accessor: "businessReg",
    },
    {
      id: "businessNumber",
      label: "사업자등록번호",
      group: "advertiser",
      accessor: "businessNumber",
    },
    {
      id: "businessAddress",
      label: "사업장주소",
      group: "advertiser",
      accessor: "businessAddress",
    },
    {
      id: "businessType1",
      label: "업태",
      group: "advertiser",
      accessor: "businessType1",
    },
    {
      id: "businessType2",
      label: "종목",
      group: "advertiser",
      accessor: "businessType2",
    },
    {
      id: "companyEmail",
      label: "업체 이메일",
      group: "advertiser",
      accessor: "companyEmail",
    },
    {
      id: "marketerEmail",
      label: "마케팅레버리지 담당자 이메일",
      group: "advertiser",
      accessor: "marketerEmail",
    },
    {
      id: "spending",
      label: "월 스펜딩(10단위)",
      group: "importance",
      accessor: "spending",
    },
    {
      id: "point",
      label: "점수: 1~5",
      group: "importance",
      accessor: "point",
    },
    {
      id: "transferDate",
      label: "이관일자",
      group: "manage",
      accessor: "transferDate",
    },
    {
      id: "taxInvoiceInfo",
      label: "세금계산서 발행정보",
      group: "manage",
      accessor: "taxInvoiceInfo",
    },
    {
      id: "payback",
      label: "페이백(요율%)",
      group: "manage",
      accessor: "payback",
    },
    {
      id: "naverpayback",
      label: "네이버",
      group: "payback",
      accessor: "payback.naver",
    },
    {
      id: "kakaopayback",
      label: "카카오",
      group: "payback",
      accessor: "payback.kakao",
    },
    {
      id: "googlepayback",
      label: "구글글",
      group: "payback",
      accessor: "payback.google",
    },
    {
      id: "carotpayback",
      label: "당근",
      group: "payback",
      accessor: "payback.carot",
    },
    {
      id: "etcpayback",
      label: "기타",
      group: "payback",
      accessor: "payback.etc",
    },
    { id: "note", label: "비고", group: "manage", accessor: "note" },

    {
      id: "leaveDate",
      label: "피이관일자",
      group: "leave",
      accessor: "leaveDate",
    },
    {
      id: "leaveDate",
      label: "사유",
      group: "leave",
      accessor: "leaveReason",
    },
    {
      id: "homepage",
      label: "홈페이지",
      group: "web",
      accessor: "homepage",
    },
    {
      id: "naverId",
      label: "아이디",
      group: "naver",
      accessor: "mediaAccount.naver.id",
    },
    {
      id: "naverPwd",
      label: "비밀번호",
      group: "naver",
      accessor: "mediaAccount.naver.pwd",
    },
    {
      id: "naverNumber",
      label: "광고계정번호",
      group: "naver",
      accessor: "mediaAccount.naver.naverNumber",
    },
    {
      id: "gfaId",
      label: "아이디",
      group: "gfa",
      accessor: "mediaAccount.gfa.id",
    },
    {
      id: "gfaPwd",
      label: "비밀번호",
      group: "gfa",
      accessor: "mediaAccount.gfa.pwd",
    },
    {
      id: "gfaNumber",
      label: "광고계정번호",
      group: "gfa",
      accessor: "mediaAccount.gfa.gfaNumber",
    },
    {
      id: "kakaoId",
      label: "아이디",
      group: "kakao",
      accessor: "mediaAccount.kakao.id",
    },
    {
      id: "kakaoPwd",
      label: "비밀번호",
      group: "kakao",
      accessor: "mediaAccount.kakao.pwd",
    },
    {
      id: "kakaoNumber",
      label: "광고계정번호",
      group: "kakao",
      accessor: "mediaAccount.kakao.kakaoNumber",
    },
    {
      id: "momentNumber",
      label: "사유",
      group: "kakao",
      accessor: "mediaAccount.kakao.momentNumber",
    },
    {
      id: "googleId",
      label: "아이디",
      group: "google",
      accessor: "mediaAccount.google.id",
    },
    {
      id: "googlePwd",
      label: "비밀번호",
      group: "google",
      accessor: "mediaAccount.google.pwd",
    },
    {
      id: "carotId",
      label: "아이디",
      group: "carot",
      accessor: "mediaAccount.carot.id",
    },
    {
      id: "carotPwd",
      label: "비밀번호",
      group: "carot",
      accessor: "mediaAccount.carot.pwd",
    },
    {
      id: "etcId",
      label: "아이디",
      group: "etc",
      accessor: "mediaAccount.etc.id",
    },
    {
      id: "etcPwd",
      label: "비밀번호",
      group: "etc",
      accessor: "mediaAccount.etc.pwd",
    },
    {
      id: "isAssisted",
      label: "사수 유무",
      group: "mentor",
      accessor: "isAssisted",
    },
    {
      id: "mentor",
      label: "사수",
      group: "mentor",
      accessor: "mentor",
    },
  ]);
  const [paybackCols, setPaybackCols] = useState([]);

  // HTML5 드래그앤드롭 방식 : Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedColumnIndex(index);
  };

  // HTML5 드래그앤드롭 방식 : Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault(); // Prevent default behavior to allow drop
  };

  // HTML5 드래그앤드롭 방식 : Handle drop
  const handleDrop = (index: number) => {
    if (
      draggedColumnIndex === null ||
      draggedColumnIndex === index ||
      columns[draggedColumnIndex].group !== columns[index].group // 그룹내에서만 이동
    )
      return;

    const newColumns = [...columns];
    const [draggedColumn] = newColumns.splice(draggedColumnIndex, 1);
    newColumns.splice(index, 0, draggedColumn);

    setColumns(newColumns);
    setDraggedColumnIndex(null); // Reset dragged index
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get("/user", {
        withCredentials: true,
      });
      const user: User = response.data.context.user;
      setUserRole(user.role);
      setUserId(user.uid);
      const marketerResponse = response.data.body;
      const marketers = marketerResponse
        .filter(
          (marketer: any) =>
            marketer.departmentUuid === "3" || marketer.uid === "leverage1259"
        )
        .sort((a: any, b: any) => a.positionUuid - b.positionUuid)
        .map((marketer: any) => ({ uid: marketer.uid, name: marketer.name }));
      setMarketerList(marketers);
      if (user.role === "admin" || user.role === "system") {
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
      const response: any = await axios.get("/sheet/account");
      // admin이면 selectedMarketer filter
      if (userRole === "admin" || userRole === "system") {
        const filteredResponse = response.data.body.filter(
          (item: any) => item.marketerUid === selectedMarketer
        );
        setAccountData(filteredResponse);
      } else if (userRole === "user") {
        const userFilteredResponse = response.data.body.filter(
          (item: any) => item.marketerUid === userId
        );
        setAccountData(userFilteredResponse);
      }
      //203 에러 : 등록된 광고주 계정이 없습니다.
      if (response.status === 203)
        console.error(response?.data?.result?.message);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  //초기 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      await fetchUser();
      if (userRole && userId) {
        getAccounts();
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
        await getAccounts();
        // 상태 초기화
        setEditingRow(null);
        setEditedRow({});
        setButtonState("default");
      } else {
        alert("등록 중 문제가 발생했습니다.");
      }
    } catch (error: any) {
      console.error("등록 실패:", error);
      alert(
        error.response?.data?.result?.message || "등록 중 문제가 발생했습니다."
      );
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
    e: React.ChangeEvent<HTMLInputElement>,
    ...keys: (keyof IAccount | string)[]
  ) => {
    setEditedRow((prev) => {
      const updated = { ...prev };
      let current: any = updated;
      keys.slice(0, -1).forEach((key) => {
        if (!current[key]) current[key] = {}; // 중첩 객체가 없을 경우 초기화
        current = current[key];
      });
      current[keys[keys.length - 1]] = e.target.value; // 마지막 키에 값 설정
      return updated;
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
          await getAccounts();

          // 상태 초기화
          setButtonState("default");
          setEditingRow(null);
          setEditedRow({});
          setSelectedRow(null);
        }
      } catch (error: any) {
        console.error("저장 실패:", error);
        alert(
          error.response?.data?.result?.message ||
            "저장 중 문제가 발생했습니다."
        );
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

      <div
        className={`${AccountStyles.accountTable} table-full-width px-0 table-responsive`}
        style={{ overflow: "auto", maxHeight: "730px" }}
      >
        <table className="table table-bordered ">
          <thead>
            <tr className="text-nowrap text-center">
              <th colSpan={1}></th>
              <th colSpan={12}>광고주 정보</th>
              <th colSpan={2}>중요도</th>
              <th colSpan={8}>관리 정보</th>
              <th colSpan={2}>이탈시</th>
              <th colSpan={1}></th>
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
              {columns.map((column, index) =>
                column.group !== "payback" ? (
                  <td
                    rowSpan={column.id !== "payback" ? 2 : undefined}
                    colSpan={column.id === "payback" ? 5 : undefined}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    style={{
                      cursor: "grab",
                      backgroundColor: "#f8f9fa",
                      textAlign: "center",
                    }}
                  >
                    {column.label}
                  </td>
                ) : null
              )}
            </tr>
            <tr
              className="text-nowrap text-center"
              style={{ backgroundColor: "#f8f9fa", textAlign: "center" }}
            >
              <td>네이버</td>
              <td>카카오</td>
              <td>구글</td>
              <td>당근</td>
              <td>기타</td>
            </tr>
            {Array.isArray(accountData) &&
              accountData.length !== 0 &&
              accountData.map((row: any, rowIndex) => (
                <tr
                  key={row.uuid}
                  className="text-nowrap text-center"
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
                  {columns.map((col) =>
                    editingRow === row.uuid ? (
                      <>
                        {col.id !== "payback" ? (
                          <td key={col.id}>
                            {/* 편집모드 */}
                            {col.id === "isAssisted" ? (
                              <input
                                type="checkbox"
                                checked={editedRow.isAssisted || false}
                                onChange={(e) => handleChange(e, "isAssisted")}
                              />
                            ) : col.accessor?.includes(".") ? (
                              // 중첩 객체 접근 처리
                              <input
                                type="text"
                                value={
                                  col.accessor
                                    .split(".")
                                    .reduce(
                                      (acc: any, key) => acc?.[key],
                                      editedRow
                                    ) || ""
                                }
                                onChange={(e) =>
                                  handleNestedFieldChange(
                                    e,
                                    ...col.accessor.split(".") // 중첩 필드 접근
                                  )
                                }
                              />
                            ) : col.id === "transferDate" ||
                              col.id === "leaveDate" ? (
                              <input
                                type="date"
                                value={
                                  editedRow[col.accessor as keyof IAccount]
                                    ? (
                                        editedRow[
                                          col.accessor as keyof IAccount
                                        ] as Date
                                      )
                                        .toISOString()
                                        .slice(0, 10) // Date -> YYYY-MM-DD
                                    : ""
                                }
                                onChange={(e) =>
                                  handleChange(
                                    e,
                                    col.accessor as keyof IAccount
                                  )
                                }
                              />
                            ) : (
                              <input
                                type="text"
                                value={
                                  (
                                    editedRow[
                                      col.accessor as keyof IAccount
                                    ] as string | number
                                  )?.toLocaleString("") || ""
                                }
                                onChange={(e) =>
                                  handleChange(
                                    e,
                                    col.accessor as keyof IAccount
                                  )
                                }
                              />
                            )}
                          </td>
                        ) : null}
                      </>
                    ) : (
                      <>
                        {col.id !== "payback" ? (
                          <td>
                            {col.id === "transferDate" ||
                            col.id == "leaveDate" ? (
                              row[col.accessor] ? (
                                dayjs(row[col.accessor]).format("YYYY-MM-DD")
                              ) : (
                                ""
                              )
                            ) : col.id == "phone" ? (
                              row[col.accessor] &&
                              row[col.accessor].length == 11 ? (
                                `${row[col.accessor]?.slice(0, 3)}-${row[
                                  col.accessor
                                ]?.slice(3, 7)}-${row[col.accessor]?.slice(7)}`
                              ) : (
                                row[col.accessor]
                              )
                            ) : col.id == "businessNumber" ? (
                              row[col.accessor] &&
                              row[col.accessor].length == 10 ? (
                                `${row[col.accessor]?.slice(0, 3)}-${row[
                                  col.accessor
                                ]?.slice(3, 5)}-${row[col.accessor]?.slice(5)}`
                              ) : (
                                row[col.accessor]
                              )
                            ) : col.id == "spending" ? (
                              Number(row[col.accessor]).toLocaleString()
                            ) : col.id == "mentor" ? (
                              marketerList.find(
                                (user: any) => user.uid === row[col.accessor]
                              )?.name || ""
                            ) : col.accessor.includes(".") ? (
                              col.group === "payback" ? (
                                // 중첩 객체 접근 처리
                                `${(
                                  (col.accessor
                                    .split(".")
                                    .reduce((acc, key) => acc?.[key], row) ||
                                    0) as number
                                ).toFixed(1)} %`
                              ) : (
                                col.accessor
                                  .split(".")
                                  .reduce((acc, key) => acc?.[key], row) || ""
                              )
                            ) : col.id === "isAssisted" ? (
                              <input
                                type="checkbox"
                                disabled
                                checked={row[col.accessor]}
                              />
                            ) : (
                              row[col.accessor]?.toLocaleString()
                            )}
                          </td>
                        ) : null}
                      </>
                    )
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
