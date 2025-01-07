import React, { useEffect, useState } from "react";
import axios from "axios";
import IUser, { roleType } from "../../common/models/user/IUser";
import IDepartment from "../../common/models/department/IDepartment";
import IPosition from "../../common/models/position/IPosition";
import Pagination from "component/Pagination";
import "./User.module.scss";
import qs from "qs";

const User: React.FC = () => {
  const [data, setData] = useState<IUser[]>([]);
  const [departmentSelect, setDepartmentSelect] = useState<IDepartment[]>([]);
  const [positionSelect, setPositionSelect] = useState<IPosition[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedRow, setEditedRow] = useState<Partial<IUser>>({}); // 행 수정 사항
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>("이름");
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;
  const currenPageData = data.slice((page - 1) * pageSize, page * pageSize);
  const [buttonState, setButtonState] = useState<"default" | "register">(
    "default"
  );

  //user 데이터 긁어오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/user");
        setData(response.data.body);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  //부서 데이터 긁어오기
  useEffect(() => {
    const fetchDpt = async () => {
      try {
        const response = await axios.get("/department");
        setDepartmentSelect(response.data.body);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };
    fetchDpt();
  }, []);

  //직책 데이터 긁어오기
  useEffect(() => {
    const fetchPos = async () => {
      try {
        const response = await axios.get("/position");
        setPositionSelect(response.data.body);
      } catch (error) {
        console.error("Failed to fetch positions:", error);
      }
    };
    fetchPos();
  }, []);

  // 데이터행 저장
  const handleSaveClick = async () => {
    if (!editingRow) return;

    if (window.confirm("저장하시겠습니까?")) {
      try {
        const originalRow = data.find((row) => row.uid === editingRow);
        if (!originalRow) {
          alert("수정할 데이터를 찾을 수 없습니다.");
          return;
        }
        const updatedFields = Object.entries(editedRow).reduce(
          (acc, [key, value]: any) => {
            if (key in originalRow) {
              const originalValue = originalRow[key as keyof IUser];
              if (value !== originalValue && value !== undefined) {
                acc[key as keyof IUser] = value;
              }
            }
            return acc;
          },
          {} as Partial<IUser>
        );
        // userId를 포함한 Fields 만들기기
        const customFields = updatedFields as Record<string, any>;
        customFields.userId = editedRow.uid;
        // 수정사항이 없을 때
        if (Object.keys(customFields).length === 0) {
          alert("수정된 내용이 없습니다.");
          return;
        }
        // 수정사항 보내기
        const response = await axios.put(`/user/${editingRow}`, customFields, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        if (response.status === 200) {
          alert("사용자 정보가 수정되었습니다.");
          const updatedUser = response.data;
          // 데이터 상태 업데이트
          setData((prevData) =>
            prevData.map((row) =>
              row.uid === editingRow ? { ...row, ...updatedUser } : row
            )
          );
          // 서버에서 최신 데이터를 가져와 동기화
          const refreshedData = await axios.get("/user");
          setData(refreshedData.data.body);
          setButtonState("default");
          setEditingRow(null);
          setEditedRow({});
        }
      } catch (error: any) {
        console.error("저장 실패:", error);
        alert(
          error.response?.data?.result?.message ||
            "저장 중 문제가 발생했습니다."
        );
        setButtonState("default");
        setEditingRow(null);
        setEditedRow({});
      }
    }
  };

  // 데이터행 취소
  const handleCancelClick = () => {
    // 수정 중인 행이 새로 추가된 행이고 이를 취소하면 삭제
    if (editingRow == "") {
      setData((prev) => {
        const updatedData = prev.filter((row) => row.uid !== editingRow);
        // 새로 추가한 행의 페이지에 데이터가 없으면 이전 페이지로 이동
        const currentPageDataCount = updatedData.slice(
          (page - 1) * pageSize,
          page * pageSize
        ).length;
        if (currentPageDataCount === 0 && page > 1) {
          setPage(page - 1);
        }
        return updatedData;
      });
    }
    setButtonState("default");
    setEditingRow(null);
    setEditedRow({});
  };
  // 데이터행 삭제
  const handleDeleteClick = async () => {
    if (!selectedRow) {
      alert("삭제할 항목을 선택해주세요."); // 선택된 행이 없을 때 경고 메시지
      return;
    }
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        //DELETE 요청
        const response = await axios.delete(`/user/${selectedRow}`);
        if (response.status === 200) {
          alert("삭제되었습니다.");
          setData(
            (prevData) => prevData.filter((row) => row.uid !== selectedRow) // 선택된 행만 삭제
          );
          setSelectedRow(null); // 선택 초기화
        }
      } catch (err: any) {
        console.error("삭제 실패:", err);
        alert(
          err.response?.data?.result?.message || "삭제 중 문제가 발생했습니다."
        );
        setButtonState("default");
        setEditingRow(null);
        setEditedRow({});
      }
    }
  };

  // 체크박스 선택
  const handleCheckboxChange = (id: string) => {
    setSelectedRow((prev) => (prev === id ? null : id));
  };
  // 수정사항에 대한 onChange
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof IUser
  ) => {
    setEditedRow((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // 새로운 행 추가
  const handleAddNew = () => {
    //마지막 데이터 확인
    const lastRow = data[data.length - 1];
    if (lastRow && (!lastRow.uid || !lastRow.name)) {
      alert("이전 행의 필수 정보를 입력하지 않아 해당 행이 삭제됩니다.");
      setData((prevData) => prevData.slice(0, -1)); // 마지막 행 삭제
      return;
    }
    setButtonState("register");
    const newUser: Partial<IUser> = {
      uid: "",
      name: "",
      birthday: "",
      positionUuid: "",
      departmentUuid: "",
      phone: "",
      directPhone: "",
      personalEmail: "",
      mbti: "",
      isResigned: false,
    };
    setData((prevData: any) => {
      const updateData = [...prevData, newUser]; // 새 데이터를 맨 뒤에 추가
      const newPage = Math.ceil(updateData.length / pageSize);
      setPage(newPage); //새 데이터가 있는 페이지로 이동
      return updateData;
    });
    setEditingRow(newUser.uid || ""); // 새로운 행을 편집 모드로 설정
    setEditedRow(newUser);
  };
  // 데이터터행 등록 api
  const handleRegisterClick = async () => {
    try {
      const requestData = {
        uid: editedRow.uid || "",
        name: editedRow.name || "",
        password: "0000",
        departmentUuid: editedRow.departmentUuid || "",
        positionUuid: editedRow.positionUuid || "",
        birthday: editedRow.birthday || "",
        phone: editedRow.phone || "",
        directPhone: editedRow.directPhone || "",
        companyEmail: editedRow.companyEmail || "",
        personalEmail: editedRow.personalEmail || "",
        mbti: editedRow.mbti || "",
      };

      const response = await axios.post("/user", qs.stringify(requestData), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (response.status === 200) {
        alert("새로운 사용자가 등록되었습니다.");
        const addedUser = response.data.body; // 서버에서 반환된 데이터
        setData((prevData) => [...prevData, addedUser]); // 데이터 목록 업데이트
        // 서버 동기화
        const refreshedData = await axios.get("/user");
        setData(refreshedData.data.body);
        setButtonState("default");
        setEditingRow(null);
        setEditedRow({});
      }
    } catch (error: any) {
      console.error("등록 실패:", error);
      alert(
        error.response?.data?.result?.message || "등록 중 문제가 발생했습니다."
      );
      setData((prev) => prev.filter((row) => row.uid !== editingRow));
      setButtonState("default");
      setEditingRow(null);
      setEditedRow({});
    }
  };

  return (
    <div className="container-fluid">
      {/* 테이블 위의 버튼 */}
      <div className="d-flex justify-content-end mb-3">
        {editingRow || selectedRow ? (
          <>
            {editingRow && buttonState !== "register" && selectedRow && (
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
                <button className="btn btn-danger" onClick={handleDeleteClick}>
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
        <select className="form-select w-auto rounded" value={sortOption}>
          <option value="이름">이름</option>
          <option value="코드">코드</option>
        </select>
      </div>

      <div className="table-full-width px-0 table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr className="text-nowrap text-center">
              <th>선택</th>
              <th>아이디</th>
              <th>이름</th>
              <th>코드</th>
              <th>생년월일</th>
              <th>직책</th>
              <th>부서</th>
              <th>연락처</th>
              <th>직통번호</th>
              <th>회사 이메일</th>
              <th>개인 이메일</th>
              <th>MBTI</th>
            </tr>
          </thead>
          <tbody>
            {currenPageData.map((row) => (
              <tr
                key={row.uid}
                style={{
                  backgroundColor:
                    editingRow === row.uid || selectedRow === row.uid
                      ? "#f0f8ff"
                      : "transparent",
                }}
                className="text-nowrap text-center"
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRow === row.uid}
                    disabled={buttonState === "register"} // 추가 상태에서는 체크박스 비활성화
                    onChange={() => {
                      if (selectedRow === row.uid) {
                        // 이미 선택된 상태 => 수정모드 off
                        setSelectedRow(null);
                        setEditingRow(null);
                        setEditedRow({});
                      } else {
                        // 체크박스 선택 => 수정모드 on
                        handleCheckboxChange(row.uid);
                        setEditingRow(row.uid);
                        setEditedRow((prev) => ({ ...prev, ...row }));
                      }
                    }}
                  />
                </td>
                {editingRow === row.uid ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editedRow.uid || ""}
                        onChange={(e) => handleChange(e, "uid")}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editedRow.name || ""}
                        onChange={(e) => handleChange(e, "name")}
                      />
                    </td>
                    <td>{row.code}</td>
                    <td>
                      <input
                        type="text"
                        value={editedRow.birthday || ""}
                        onChange={(e) => handleChange(e, "birthday")}
                      />
                    </td>
                    <td>
                      <select
                        value={editedRow.positionUuid || ""}
                        onChange={(e) => handleChange(e, "positionUuid")}
                      >
                        <option value="">직책 선택</option>
                        {positionSelect.map((pos) => (
                          <option key={pos.uuid} value={pos.uuid}>
                            {pos.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={editedRow.departmentUuid || ""}
                        onChange={(e) => handleChange(e, "departmentUuid")}
                      >
                        <option value="">부서 선택</option>
                        {departmentSelect.map((dpt) => (
                          <option key={dpt.uuid} value={dpt.uuid}>
                            {dpt.name}
                          </option>
                        ))}
                      </select>
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
                        value={editedRow.directPhone || ""}
                        onChange={(e) => handleChange(e, "directPhone")}
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
                        value={editedRow.personalEmail || ""}
                        onChange={(e) => handleChange(e, "personalEmail")}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editedRow.mbti || ""}
                        onChange={(e) => handleChange(e, "mbti")}
                      />
                    </td>
                  </>
                ) : (
                  <>
                    <td>{row.uid}</td>
                    <td>{row.name}</td>
                    <td>{row.code}</td>
                    <td>{row.birthday}</td>
                    <td>
                      {
                        positionSelect.find(
                          (pos) => pos.uuid === row.positionUuid
                        )?.name
                      }
                    </td>
                    <td>
                      {
                        departmentSelect.find(
                          (dpt) => dpt.uuid === row.departmentUuid
                        )?.name
                      }
                    </td>
                    <td>{row.phone}</td>
                    <td>{row.directPhone}</td>
                    <td>{row.companyEmail}</td>
                    <td>{row.personalEmail}</td>
                    <td>{row.mbti}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalCount={data.length}
        setPage={setPage}
        pageSize={pageSize}
      />
    </div>
  );
};

export default User;
