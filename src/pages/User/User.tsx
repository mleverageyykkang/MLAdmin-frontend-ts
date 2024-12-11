import React, { useEffect, useState } from "react";
import axios from "axios";
import IUser, { roleType } from "../../common/models/user/IUser";
import IDepartment from "common/models/department/IDepartment";
import IPosition from "common/models/position/IPosition";
import Pagination from "src/component/Pagination";
import styles from "./User.module.scss";
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
  const pageSize = 10;
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
  // 데이터행 수정
  const handleEditClick = (id: string) => {
    if (editingRow === id) return;
    setEditingRow(id);
    const rowToEdit = data.find((row) => row.uid === id);
    setEditedRow((prev) => ({ ...prev, ...rowToEdit }));
  };
  // 데이터행 수정 후 저장
  const handleSaveClick = async () => {
    if (!editingRow) return;
    if (window.confirm("저장하시겠습니까?")) {
      try {
        const requestData = {
          uid: editedRow.uid,
          name: editedRow.name || "",
          departmentUuid: editedRow.departmentUuid || "",
          positionUuid: editedRow.positionUuid || "",
          birthday: editedRow.birthday || "",
          phone: editedRow.phone || "",
          directPhone: editedRow.directPhone || "",
          companyEmail: editedRow.companyEmail || "",
          personalEmail: editedRow.personalEmail || "",
          mbti: editedRow.mbti || "",
        };

        const response = await axios.put(
          `/user/${editedRow.uid}`,
          qs.stringify(requestData),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        if (response.status === 200) {
          alert("사용자 정보가 수정되었습니다.");
          setData((prevData) =>
            prevData.map((row) =>
              row.uid === editedRow.uid
                ? {
                    ...row,
                    uid: editedRow.uid || row.uid,
                    name: editedRow.name || row.name,
                    role: editedRow.role || row.role,
                    code: editedRow.code || row.code,
                    departmentUuid:
                      editedRow.departmentUuid || row.departmentUuid,
                    positionUuid: editedRow.positionUuid || row.positionUuid,
                    birthday: editedRow.birthday || row.birthday,
                    phone: editedRow.phone || row.phone,
                    directPhone: editedRow.directPhone || row.directPhone,
                    companyEmail: editedRow.companyEmail || row.companyEmail,
                    personalEmail: editedRow.personalEmail || row.personalEmail,
                    mbti: editedRow.mbti || row.mbti,
                    isResigned: editedRow.isResigned ?? row.isResigned,
                    createdAt: row.createdAt,
                    updatedAt: new Date(),
                  }
                : row
            )
          );
          setButtonState("default");
          setEditingRow(null);
          setEditedRow({});
        }
      } catch (error) {
        console.error("저장 실패:", error);
        alert("저장 중 문제가 발생했습니다.");
      }
    }
  };

  // 데이터행 취소
  const handleCancelClick = () => {
    // 수정 중인 행이 새로 추가된 행이고 이를 취소하면 삭제
    if (
      editingRow &&
      data.find((row) => row.uid === editingRow && row.name === "")
    ) {
      setData((prevData) => {
        const updatedData = prevData.filter((row) => row.uid !== editingRow);
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
  // 멀티데이터행 삭제
  const handleDeleteClick = () => {
    if (!selectedRow) {
      alert("삭제할 항목을 선택해주세요."); // 선택된 행이 없을 때 경고 메시지
      return;
    }
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setData(
        (prevData) => prevData.filter((row) => row.uid !== selectedRow) // 선택된 행만 삭제
      );
      setSelectedRow(null); // 선택 초기화
    } else {
      return false;
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
    console.log(
      "field: ",
      field,
      "value:",
      e.target.value,
      "edited:",
      editedRow[field],
      editedRow.uid
    );
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
    const newUser: IUser = {
      uid: "",
      name: "",
      code: data.length + 1,
      birthday: "",
      positionUuid: "",
      departmentUuid: "",
      phone: "",
      directPhone: "",
      companyEmail: "",
      personalEmail: "",
      mbti: "",
      isResigned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: roleType.USER,
    };
    setData((prevData) => {
      const updateData = [...prevData, newUser]; // 새 데이터를 맨 뒤에 추가
      const newPage = Math.ceil(updateData.length / pageSize);
      setPage(newPage); //새 데이터가 있는 페이지로 이동
      return updateData;
    });
    setEditingRow(newUser.uid); // 새로운 행을 편집 모드로 설정
    setEditedRow(newUser);
  };
  // 새로운 행 등록 api
  const handleRegisterClick = async () => {
    try {
      const requestData = {
        uid: editedRow.uid || "",
        name: editedRow.name || "",
        password: "defaultPassword",
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
        setButtonState("default");
        setEditingRow(null);
        setEditedRow({});
      }
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="container-fluid">
      {/* 테이블 위의 버튼 */}
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
        <select className="form-select w-auto  rounded" value={sortOption}>
          <option value="이름">이름</option>
          <option value="코드">코드</option>
        </select>
      </div>
      <div className="card">
        <div className="card-body table-full-width px-0 table-responsive">
          <table className={`table-hover table text-center ${styles.table}`}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedRow === null}
                    onChange={() => setSelectedRow(null)} // 전체 선택 해제
                  />
                </th>
                <th>아이디</th>
                <th>이름</th>
                <th className="text-nowrap">코드</th>
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
                  onClick={() => handleEditClick(row.uid)}
                  style={{
                    backgroundColor:
                      editingRow === row.uid || selectedRow === row.uid
                        ? "#f8f9fa"
                        : "transparent",
                  }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRow === row.uid}
                      disabled={buttonState === "register"} // 추가 상태에서는 체크박스 비활성화
                      onChange={() => handleCheckboxChange(row.uid)}
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
