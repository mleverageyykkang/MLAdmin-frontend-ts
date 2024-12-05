import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import axios from "axios";
import IUser, { roleType } from "../../common/models/user/IUser";

interface Position {
  uid: string;
  name: string;
}

interface Department {
  uid: string;
  name: string;
}
const API_URL = "http://localhost:20220";
const User: React.FC = () => {
  const [data, setData] = useState<IUser[]>([]);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const currentPageData = data.slice((page - 1) * pageSize, page * pageSize);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedRow, setEditedRow] = useState<Partial<IUser>>({});
  const [newRow, setNewRow] = useState<Partial<IUser> | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/user?page=${page}&pageSize=${pageSize}`
        );
        setData(response.data.body);
        console.log(response.data.body);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [page]);
  const positionSelect: Position[] = [
    {
      uid: "1",
      name: "대표",
    },
    {
      uid: "2",
      name: "실장",
    },
    {
      uid: "3",
      name: "부장",
    },
    {
      uid: "4",
      name: "차장",
    },
    {
      uid: "5",
      name: "대리",
    },
    {
      uid: "6",
      name: "사원",
    },
  ];
  const departmentSelect: Department[] = [
    {
      uid: "1",
      name: "본부",
    },
    {
      uid: "2",
      name: "경영관리",
    },
    {
      uid: "3",
      name: "개발",
    },
    {
      uid: "4",
      name: "마케팅",
    },
  ];

  const handleEditClick = (id: string) => {
    setEditingRow(id);
    const rowToEdit = data.find((row) => row.uid === id);
    setEditedRow({ ...rowToEdit });
  };

  const handleSaveClick = (id: string) => {
    if (newRow && editingRow === newRow.uid) {
      setNewRow(null);
    }
    setData((prevData) =>
      prevData.map((row) =>
        row.uid === id ? ({ ...editedRow } as IUser) : row
      )
    );
    setEditingRow(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof IUser
  ) => {
    setEditedRow({ ...editedRow, [field]: e.target.value });
  };

  const handleCancelClick = () => {
    // 수정 중인 행이 새로 추가된 행이고 이를 취소하면 삭제
    if (newRow && editingRow === newRow.uid) {
      setData((prevData) => prevData.filter((row) => row.uid !== newRow.uid));
      setNewRow(null);
    }
    setEditingRow(null);
    setEditedRow({});
  };
  const handleDeleteClick = (id: string) => {
    setData((prevData) => {
      return prevData.filter((row) => row.uid !== id);
    });
  };
  const addNewRow = () => {
    const newRow: IUser = {
      uid: (data.length + 1).toString(), //추가 후 보냄?
      role: roleType.USER,
      name: "",
      password: "",
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
    };
    setData((prevData) => {
      const updatedData = [...prevData, newRow];
      const newPage = Math.ceil(updatedData.length / pageSize);
      setPage(newPage); // 해당 페이지로 이동
      return updatedData;
    });
    setNewRow(newRow);
    setEditingRow(newRow.uid);
    setEditedRow(newRow);
  };
  return (
    <>
      <div className="container-fluid">
        <div className="row ">
          <div className="col">
            <div className="card strpied-tabled-with-hover">
              <div className="card-header d-flex justify-content-end">
                <i
                  className="nc-icon nc-zoom-split "
                  style={{ fontSize: "20px", padding: "0.7rem 30px" }}
                />
                <Dropdown>
                  <Dropdown.Toggle
                    aria-expanded={false}
                    aria-haspopup={true}
                    data-toggle="dropdown"
                    id="navbarDropdownMenuLink"
                    variant="default"
                    className="m-0 rounded border"
                  >
                    <i className="nc-icon nc-align-left-2 mr-1" />
                    <span>정렬</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu aria-labelledby="navbarDropdownMenuLink">
                    <Dropdown.Item href="#" onClick={(e) => e.preventDefault()}>
                      이름
                    </Dropdown.Item>
                    <Dropdown.Item href="#" onClick={(e) => e.preventDefault()}>
                      사번
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <button
                  className="ml-2 border-0 bg-primary-subtle rounded"
                  onClick={addNewRow}
                >
                  등록
                </button>
              </div>
              <div className="card-body table-full-width px-0 table-responsive">
                <table className="table-hover table table-striped text-nowrap text-center">
                  <thead>
                    <tr>
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
                      <th>관리</th>
                      <th>삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageData &&
                      currentPageData.map((row) => (
                        <tr key={row.uid}>
                          {editingRow === row.uid ? (
                            <>
                              <td>
                                <input
                                  type="text"
                                  value={editedRow.name}
                                  onChange={(e) => handleChange(e, "name")}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={editedRow.code}
                                  onChange={(e) => handleChange(e, "code")}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={editedRow.birthday}
                                  onChange={(e) => handleChange(e, "birthday")}
                                />
                              </td>
                              <td>
                                <select
                                  value={editedRow.positionUuid || ""}
                                  onChange={(e) =>
                                    handleChange(e, "positionUuid")
                                  }
                                >
                                  <option value="직책 선택" disabled hidden>
                                    직책 선택
                                  </option>
                                  {positionSelect.map((pos) => (
                                    <option key={pos.uid} value={pos.uid}>
                                      {pos.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <select
                                  value={editedRow.departmentUuid || ""}
                                  onChange={(e) =>
                                    handleChange(e, "departmentUuid")
                                  }
                                >
                                  <option value="부서 선택" disabled hidden>
                                    부서 선택
                                  </option>
                                  {departmentSelect.map((dpt) => (
                                    <option key={dpt.uid} value={dpt.uid}>
                                      {dpt.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={editedRow.phone}
                                  onChange={(e) => handleChange(e, "phone")}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={editedRow.directPhone}
                                  onChange={(e) =>
                                    handleChange(e, "directPhone")
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={editedRow.companyEmail}
                                  onChange={(e) =>
                                    handleChange(e, "companyEmail")
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={editedRow.personalEmail}
                                  onChange={(e) =>
                                    handleChange(e, "personalEmail")
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={editedRow.mbti}
                                  onChange={(e) => handleChange(e, "mbti")}
                                />
                              </td>
                              <td>
                                <button
                                  className="border rounded border-0 bg-primary text-white mr-2"
                                  onClick={() => {
                                    if (window.confirm("저장하시겠습니까?")) {
                                      handleSaveClick(row.uid);
                                    } else return false;
                                  }}
                                >
                                  저장
                                </button>
                                <button
                                  className="border rounded border-muted bg-white "
                                  onClick={handleCancelClick}
                                >
                                  취소
                                </button>
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
                                    (pos) => pos.uid == row.positionUuid
                                  )?.name
                                }
                              </td>
                              <td>
                                {
                                  departmentSelect.find(
                                    (dpt) => dpt.uid == row.departmentUuid
                                  )?.name
                                }
                              </td>
                              <td>{row.phone}</td>
                              <td>{row.directPhone}</td>
                              <td>{row.companyEmail}</td>
                              <td>{row.personalEmail}</td>
                              <td>{row.mbti}</td>
                              <td>
                                <button
                                  className="border rounded border-0 bg-primary text-white"
                                  onClick={() => handleEditClick(row.uid)}
                                >
                                  수정
                                </button>
                              </td>
                            </>
                          )}
                          <td>
                            <button
                              className="border rounded border-0 text-white bg-danger"
                              onClick={() => {
                                if (window.confirm("정말 삭제하시겠습니까?")) {
                                  handleDeleteClick(row.uid);
                                } else return false;
                              }}
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        {/* <Pagination
          page={page}
          totalCount={data.length}
          pageSize={pageSize}
          setPage={setPage}
        /> */}
      </div>
    </>
  );
};

export default User;
