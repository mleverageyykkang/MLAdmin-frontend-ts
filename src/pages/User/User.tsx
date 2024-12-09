import React, { useEffect, useState } from "react";
import axios from "axios";
import IUser, { roleType } from "../../common/models/user/IUser";
import IDepartment from "common/models/department/IDepartment";
import IPosition from "common/models/position/IPosition";
import Pagination from "src/component/Pagination";
import styles from "./User.module.scss";

const User: React.FC = () => {
  const [data, setData] = useState<IUser[]>([]);
  const [departmentSelect, setDepartmentSelect] = useState<IDepartment[]>([]);
  const [positionSelect, setPositionSelect] = useState<IPosition[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedRow, setEditedRow] = useState<Partial<IUser>>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState<string>("이름");
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const currenPageData = data.slice((page - 1) * pageSize, page * pageSize);

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
    setEditingRow(id);
    const rowToEdit = data.find((row) => row.uid === id);
    setEditedRow({ ...rowToEdit });
  };
  // 데이터행 수정 후 저장
  const handleSaveClick = () => {
    if (window.confirm("저장하시겠습니까?")) {
      setData((prevData) => 
        prevData.map((row) =>
          row.uid === editingRow ? ({ ...editedRow } as IUser) : row
        )
      );
      setEditingRow(null);
      setEditedRow({});
    } else return false;
  };
  // 데이터행 수정 후 취소
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
    setEditingRow(null);
    setEditedRow({});
  };
  // 멀티데이터행 삭제
  const handleDeleteClick = () => {
    if (selectedRows.size === 0) {
      alert("삭제할 항목을 선택해주세요."); // 선택된 행이 없을 때 경고 메시지
      return;
    }
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setData((prevData) =>
        prevData.filter((row) => !selectedRows.has(row.uid))
      );
      setSelectedRows(new Set()); // 선택된 행 초기화
    } else return false;
  };
  // 체크박스 선택
  const handleCheckboxChange = (id: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  // 수정사항에 대한 onChange
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof IUser
  ) => {
    setEditedRow({ ...editedRow, [field]: e.target.value });
  };
  // 새로운 행 추가
  const handleAddNew = () => {
    const newUser: IUser = {
      uid: (data.length + 1).toString(),
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
    setEditingRow(newUser.uid);
    setEditedRow(newUser);
  };

  return (
    <div className="container-fluid">
      {/* 테이블 */}
      {/* 테이블 위의 버튼 */}
      <div className="d-flex justify-content-end mb-2">
        {editingRow || selectedRows.size > 0 ? (
          <>
            {editingRow && (
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
        <select className="form-select w-auto mx-2 rounded" value={sortOption}>
          <option value="이름">이름</option>
          <option value="코드">코드</option>
        </select>
        {/* 등록 버튼 */}
        <button className="btn btn-success" onClick={handleAddNew}>
          등록
        </button>
      </div>
      <div className="card">
        <div className="card-body table-full-width px-0 table-responsive">
          <table className={`table-hover table text-center ${styles.table}`}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(data.map((row) => row.uid)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    checked={selectedRows.size === data.length}
                  />
                </th>
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
                  onClick={() => handleEditClick(row.uid)}
                  style={{
                    backgroundColor:
                      editingRow === row.uid || selectedRows.has(row.uid)
                        ? "#f8f9fa"
                        : "transparent",
                  }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.uid)}
                      onChange={(e) => {
                        e.stopPropagation(); // 클릭 이벤트 중단
                        handleCheckboxChange(row.uid);
                      }}
                    />
                  </td>
                  {editingRow === row.uid ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={editedRow.name || ""}
                          onChange={(e) => handleChange(e, "name")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedRow.code || ""}
                          onChange={(e) => handleChange(e, "code")}
                        />
                      </td>
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
                          onChange={(e) => {
                            console.log(e.target.value);
                            handleChange(e, "positionUuid");
                          }}
                        >
                          <option value="0" disabled hidden>
                            직책 선택
                          </option>
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
                          <option value="0" disabled hidden>
                            부서 선택
                          </option>
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
