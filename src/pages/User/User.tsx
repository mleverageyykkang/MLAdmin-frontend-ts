import React, { useEffect, useState } from "react";
import axios from "axios";
import IUser, { roleType } from "../../common/models/user/IUser";
import IDepartment from "../../common/models/department/IDepartment";
import IPosition from "../../common/models/position/IPosition";
import Pagination from "component/Pagination";
import styles from "./User.module.scss";
import qs from "qs";
import dayjs from "dayjs";

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
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(
    null
  );
  const [columns, setColumns] = useState<
    Array<{ id: string; label: string; accessor: keyof IUser }>
  >([
    { id: "uid", label: "아이디", accessor: "uid" },
    { id: "name", label: "이름", accessor: "name" },
    { id: "code", label: "코드", accessor: "code" },
    { id: "birthday", label: "생년월일", accessor: "birthday" },
    { id: "positionUuid", label: "직책", accessor: "positionUuid" },
    { id: "departmentUuid", label: "부서", accessor: "departmentUuid" },
    { id: "phone", label: "연락처", accessor: "phone" },
    { id: "directPhone", label: "직통번호", accessor: "directPhone" },
    { id: "companyEmail", label: "회사 이메일", accessor: "companyEmail" },
    { id: "personalEmail", label: "개인 이메일", accessor: "personalEmail" },
    { id: "mbti", label: "MBTI", accessor: "mbti" },
  ]);

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
    if (draggedColumnIndex === null || draggedColumnIndex === index) return;

    const newColumns = [...columns];
    const [draggedColumn] = newColumns.splice(draggedColumnIndex, 1);
    newColumns.splice(index, 0, draggedColumn);

    setColumns(newColumns);
    setDraggedColumnIndex(null);
  };

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
        if (originalRow.uid !== editedRow.uid) {
          customFields.userId = editedRow.uid;
        }
        // 수정사항이 없을 때
        if (Object.keys(customFields).length === 0) {
          alert("수정된 내용이 없습니다.");
          return;
        }
        console.log("customFields:", customFields);
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
          setSelectedRow(null);
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
    const value =
      field === "phone"
        ? e.target.value
            .replace(/[^0-9]/g, "")
            .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
            .replace(/(\-{1,2})$/g, "")
        : field === "directPhone"
        ? e.target.value
            .replace(/[^0-9]/g, "")
            .replace(/^(\d{0,2})(\d{0,4})(\d{0,4})$/g, `$1-$2-$3`)
            .replace(/(\-{1,2})$/g, "")
        : e.target.value;
    setEditedRow((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof IUser
  ) => {
    const value = e.target.value
      .replace(/[^0-9]/g, "")
      .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
      .replace(/(\-{1,2})$/g, "");

    setEditedRow((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      <div className={`${styles["filter-container"]} mb-3`}>
        {editingRow || selectedRow ? (
          <>
            {editingRow && buttonState !== "register" && selectedRow && (
              <>
                <button
                  className={`${styles["btn-blue"]} mr-2`}
                  onClick={handleSaveClick}
                >
                  저장
                </button>
                <button
                  className={`${styles["btn-cancel"]} mr-2`}
                  onClick={handleCancelClick}
                >
                  취소
                </button>
                <button
                  className={`${styles["btn-red"]} mr-2`}
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
          <button
            className={`${styles["btn-green"]} mr-2`}
            onClick={handleAddNew}
          >
            추가
          </button>
        ) : (
          <>
            <button
              className={`${styles["btn-green"]} mr-2`}
              onClick={handleRegisterClick}
            >
              등록
            </button>
            <button
              className={`${styles["btn-cancel"]} mr-2`}
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

      <div>
        <table className={styles["user-table"]}>
          <thead>
            <tr>
              <th>선택</th>
              {columns.map((col, index) => (
                <th
                  key={col.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currenPageData.map((row: any) => (
              <tr key={row.uid}>
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
                {/* 동적으로 columns 순서에 따라 열 생성 */}
                {columns.map((col) =>
                  editingRow === row.uid ? (
                    <td key={col.id}>
                      {col.id === "positionUuid" ? (
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
                      ) : col.id === "departmentUuid" ? (
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
                      ) : col.id === "birthday" ? (
                        <input
                          type="date"
                          value={
                            editedRow.birthday
                              ? dayjs(editedRow.birthday).format("YYYY-MM-DD")
                              : ""
                          }
                          onChange={(e) => handleChange(e, "birthday")}
                        />
                      ) : col.id !== "code" ? (
                        <input
                          type="text"
                          value={
                            (
                              editedRow[col.accessor] as string | number
                            )?.toLocaleString() || "" // 그대로 사용
                          }
                          onChange={(e) => handleChange(e, col.accessor)}
                        />
                      ) : (
                        row[col.accessor]
                      )}
                    </td>
                  ) : (
                    <td>
                      {col.id === "positionUuid"
                        ? positionSelect.find(
                            (pos) => pos.uuid === row.positionUuid
                          )?.name
                        : col.id === "departmentUuid"
                        ? departmentSelect.find(
                            (dpt) => dpt.uuid === row.departmentUuid
                          )?.name
                        : col.id === "phone"
                        ? row[col.accessor]?.length === 11 // 휴대폰 번호 길이 확인
                          ? `${row[col.accessor].slice(0, 3)}-${row[
                              col.accessor
                            ].slice(3, 7)}-${row[col.accessor].slice(7)}`
                          : row[col.accessor]
                        : col.id === "directPhone"
                        ? row[col.accessor]?.length === 10 // 휴대폰 번호 길이 확인
                          ? `${row[col.accessor].slice(0, 2)}-${row[
                              col.accessor
                            ].slice(2, 6)}-${row[col.accessor].slice(6)}`
                          : row[col.accessor]
                        : row[col.accessor]?.toLocaleString("")}
                    </td>
                  )
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
