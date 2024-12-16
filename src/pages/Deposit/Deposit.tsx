import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import IDeposit, {
  paymentType,
  processType,
} from "../../common/models/deposit/IDeposit";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "providers/authProvider";

interface User {
  uid: string;
  role: string;
}

const Deposit: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [depositData, setDepositData] = useState<IDeposit[]>([]);
  const [selectedRow, setSelectedRow] = useState<IDeposit | null>(null);
  const [newDeposit, setNewDeposit] = useState<Partial<IDeposit>>({
    uuid: `temp-${Date.now()}`,
    progressDate: new Date(),
    company: "",
    depositor: "",
    depositDate: new Date(),
    taxInvoice: "",
    depositAmount: 0,
    paymentType: "" as paymentType,
    processType: "" as processType,
    charges: [],
    rechargeableAmount: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false); // 모달 상태
  const [deleteInput, setDeleteInput] = useState<string>(""); // 삭제 입력 값

  //role 확인
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

  //전체입금내역 불러오기
  useEffect(() => {
    const getDeposits = async () => {
      try {
        const response = await axios.get("/sheet/deposit");
        setDepositData(response.data.body);
      } catch (error) {
        console.error("Failed to get DepositData: ", error);
        alert("전체 입금 데이터를 불러오는데 실패하였습니다.");
      }
    };
    getDeposits();
    console.log("depositData:", depositData);
  }, []);

  if (userRole === null) {
    return <div>Loading...</div>; // 사용자 역할 로딩 중
  }

  // 선택된 행의 chargeData 불러오기
  const getChargeData = async (uuid: string) => {
    try {
      const resposne = await axios.get(`/sheet/deposit/${uuid}/charge`);
      const chargeData = resposne.data;
      console.log("chargeData:", chargeData);
      setSelectedRow((prev) => (prev ? { ...prev, chargeData } : null));
    } catch (error) {
      console.error("Failed to get chargeData:", error);
      alert("충전 데이터를 불러오는데 실패하였습니다.");
    }
  };
  // 행 클릭 이벤트 처리
  const handleRowClick = (row: IDeposit) => {
    setSelectedRow({ ...row }); // 선택된 데이터 복사
    if (row.uuid) {
      getChargeData(row.uuid);
    }
  };

  // 입력값 변경 처리
  const handleInputChange = (
    field: string,
    value: string | number | Date,
    isChargeField: boolean = false
  ) => {
    if (selectedRow) {
      // 기존 행 수정
      const updatedRow = {
        ...selectedRow,
        ...(isChargeField
          ? {
              charges: selectedRow.charges?.map((charge) =>
                charge.uuid === selectedRow.charges?.[0]?.uuid
                  ? { ...charge, [field]: value }
                  : charge
              ),
            }
          : { [field]: value }),
      };
      setSelectedRow(updatedRow);
    } else {
      // 새 행 추가
      setNewDeposit((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleRegisterDeposit = async () => {
    // handle에서 temp로 추가하는 값들은 다 없애고 보내기
    try {
      const response = await axios.post("/sheet/deposit", newDeposit, {
        withCredentials: true,
      });
      console.log("등록 성공:", response.data);

      // 성공적으로 등록한 경우 테이블 업데이트
      setDepositData((prev) => [...prev, response.data]);
      setNewDeposit({
        uuid: `temp-${Date.now()}`,
        progressDate: new Date(),
        company: "",
        depositor: "",
        depositDate: new Date(),
        taxInvoice: "",
        depositAmount: 0,
        paymentType: "" as paymentType,
        processType: "" as processType,
        charges: [],
        rechargeableAmount: 0,
      });
      alert("입금이 등록되었습니다.");
    } catch (error) {
      console.error("등록 실패:", error);
      alert("입금 등록에 실패했습니다.");
    }
  };

  const handleCancelClick = () => {};
  const handleRegisterCharge = () => {
    // handle에서 temp로 추가하는 값들은 다 없애고 보내기
  };

  // 삭제 버튼 클릭 -> 모달 표시
  const handleDeleteClick = () => {
    if (!selectedRow) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }
    setShowDeleteModal(true); // 모달 열기
  };

  // 삭제 수행
  const handleConfirmDelete = async () => {
    if (deleteInput !== "삭제") {
      alert("삭제를 정확히 입력해주세요.");
      return;
    }
    try {
      await axios.delete(`/sheet/deposit/${selectedRow}`, {
        data: { confirm: deleteInput }, // "삭제" 입력값 request body로 전달
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("선택한 항목이 삭제되었습니다.");
      setDepositData((prevData) =>
        prevData.filter((row) => row.uuid !== selectedRow?.uuid)
      );
      setSelectedRow(null); // 선택 초기화
      setShowDeleteModal(false); // 모달 닫기
      setDeleteInput(""); // 입력 초기화
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 문제가 발생했습니다.");
    }
  };

  return (
    <div>
      {/* 필터 부분 */}
      <div className="mb-4">
        <label className="mr-2">기간</label>
        <select className="mr-2">
          <option>2024년</option>
        </select>
        <select className="mr-2">
          <option>12월</option>
        </select>
        {(userRole == "system" || userRole == "admin") && (
          <>
            <label className="mr-2">이름:</label>
            <select className="mr-2">
              <option value="marketer1">마케터1</option>
              <option value="marketer2">마케터2</option>
            </select>
          </>
        )}
      </div>

      {/* 입금 테이블 */}
      <div className="ml-3 d-flex justify-content-between align-items-center">
        <h5>입금</h5>
        <div>
          {selectedRow ? (
            <button className="btn btn-success mr-2" onClick={() => {}}>
              저장
            </button>
          ) : (
            <button
              className="btn btn-success mr-2"
              onClick={handleRegisterDeposit}
            >
              등록
            </button>
          )}
          <button className="btn btn-secondary mr-4">취소</button>
        </div>
      </div>
      <div className="card-body table-full-width table-responsive">
        <table className="table">
          <thead>
            <tr className="text-nowrap text-center">
              <th>진행일자</th>
              <th>업체명</th>
              <th>입금자명</th>
              <th>입금일</th>
              <th>세금계산서</th>
              <th>입금금액</th>
              <th>결제방식</th>
              <th>처리방식</th>
            </tr>
          </thead>
          <tbody>
            {selectedRow ? (
              // 기존 행 수정 모드
              <tr>
                {[
                  { field: "progressDate", value: selectedRow.progressDate },
                  { field: "company", value: selectedRow.company },
                  { field: "depositor", value: selectedRow.depositor },
                  { field: "depositDate", value: selectedRow.depositDate },
                  { field: "taxInvoice", value: selectedRow.taxInvoice },
                  { field: "depositAmount", value: selectedRow.depositAmount },
                  { field: "paymentType", value: selectedRow.paymentType },
                  { field: "processType", value: selectedRow.processType },
                ].map(({ field, value }, index) => (
                  <td key={index}>
                    {field === "paymentType" ? (
                      <select
                        className="w-100"
                        value={value?.toLocaleString("") || ""}
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            e.target.value as paymentType
                          )
                        }
                      >
                        <option value="">선택</option>
                        <option value={paymentType.CARD}>카드</option>
                        <option value={paymentType.TRANSFER}>계좌이체</option>
                      </select>
                    ) : field === "processType" ? (
                      <select
                        className="w-100"
                        value={value?.toLocaleString() || ""}
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            e.target.value as processType
                          )
                        }
                      >
                        <option value="">선택</option>
                        <option value={processType.DEFAULT}>기본</option>
                        <option value={processType.PRECHARTE}>선충전</option>
                        <option value={processType.DEDUCT}>차감</option>
                      </select>
                    ) : (
                      <input
                        type={
                          field === "progressDate" || field === "depositDate"
                            ? "date"
                            : "text"
                        }
                        className="w-100"
                        value={
                          value instanceof Date
                            ? dayjs(value).format("YYYY-MM-DD")
                            : value || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            field === "depositAmount"
                              ? parseInt(e.target.value.replace(/,/g, "")) || 0
                              : field === "progressDate" ||
                                field === "depositDate"
                              ? new Date(e.target.value)
                              : e.target.value
                          )
                        }
                      />
                    )}
                  </td>
                ))}
              </tr>
            ) : (
              // 새 행 추가 모드
              <tr>
                {[
                  { field: "progressDate", value: newDeposit.progressDate },
                  { field: "company", value: newDeposit.company },
                  { field: "depositor", value: newDeposit.depositor },
                  { field: "depositDate", value: newDeposit.depositDate },
                  { field: "taxInvoice", value: newDeposit.taxInvoice },
                  { field: "depositAmount", value: newDeposit.depositAmount },
                  { field: "paymentType", value: newDeposit.paymentType },
                  { field: "processType", value: newDeposit.processType },
                ].map(({ field, value }, index) => (
                  <td key={index}>
                    {field === "paymentType" ? (
                      <select
                        className="w-100"
                        value={value?.toLocaleString("") || ""}
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            e.target.value as paymentType
                          )
                        }
                      >
                        <option value="">선택</option>
                        <option value={paymentType.CARD}>카드</option>
                        <option value={paymentType.TRANSFER}>계좌이체</option>
                      </select>
                    ) : field === "processType" ? (
                      <select
                        className="w-100"
                        value={value?.toLocaleString("") || ""}
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            e.target.value as processType
                          )
                        }
                      >
                        <option value="">선택</option>
                        <option value={processType.DEFAULT}>기본</option>
                        <option value={processType.PRECHARTE}>선충전</option>
                        <option value={processType.DEDUCT}>차감</option>
                      </select>
                    ) : (
                      <input
                        type={
                          field === "progressDate" || field === "depositDate"
                            ? "date"
                            : "text"
                        }
                        className="w-100"
                        value={
                          value instanceof Date
                            ? dayjs(value).format("YYYY-MM-DD")
                            : value || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            field === "depositAmount"
                              ? parseInt(e.target.value.replace(/,/g, "")) || 0
                              : field === "progressDate" ||
                                field === "depositDate"
                              ? new Date(e.target.value)
                              : e.target.value
                          )
                        }
                      />
                    )}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 충전 테이블 */}
      <div className="ml-3 d-flex justify-content-between">
        <h5>
          충전 (충전가능금액:{" "}
          {selectedRow?.rechargeableAmount?.toLocaleString("") || 0} 원)
        </h5>
        <div>
          {selectedRow ? (
            <button className="btn btn-success mr-2" onClick={() => {}}>
              저장
            </button>
          ) : (
            <button
              className="btn btn-success mr-2"
              onClick={handleRegisterCharge}
            >
              등록
            </button>
          )}
          <button className="btn btn-secondary mr-4">취소</button>
        </div>
      </div>
      <div className="card-body table-full-width table-responsive border-bottom mb-4">
        <table className="table">
          <thead>
            <tr className="text-nowrap text-center">
              <th>생성 시간</th>
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
            {selectedRow?.charges?.map((charge, chargeIndex) => (
              <tr key={charge.uuid || chargeIndex}>
                {[
                  {
                    field: "createdAt",
                    value: charge.createdAt,
                  },
                  { field: "naver", value: charge.naver },
                  { field: "gfa", value: charge.gfa },
                  { field: "kakao", value: charge.kakao },
                  { field: "moment", value: charge.moment },
                  { field: "google", value: charge.google },
                  { field: "carot", value: charge.carot },
                  { field: "nosp", value: charge.nosp },
                  { field: "meta", value: charge.meta },
                  { field: "dable", value: charge.dable },
                  { field: "remitPay", value: charge.remitPay },
                  { field: "netSales", value: charge.netSales },
                ].map(({ field, value }, index) => (
                  <td key={`${charge.uuid}-${index}`}>
                    <input
                      type="text"
                      className="w-100 text-center"
                      value={
                        value &&
                        typeof value === "object" &&
                        value !== null &&
                        value instanceof Date
                          ? dayjs(value).format("YYYY-MM-DD")
                          : value?.toLocaleString?.() || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          field,
                          parseInt(e.target.value.replace(/,/g, "")) || 0,
                          true
                        )
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 리스트 테이블 */}
      <div className="ml-3 d-flex justify-content-between">
        <h5>리스트</h5>
        <div className="align-items-center d-flex">
          <button className="btn btn-danger mr-2" onClick={handleDeleteClick}>
            삭제
          </button>
          <select className="mr-4 h-100" name="" id="">
            전체
            <option value="total">전체</option>
            <option value="finished">완료</option>
            <option value="unfinished">미완료</option>
          </select>
        </div>
      </div>
      <div className="card-body table-full-width table-responsive">
        <table className="table table-hover">
          <thead>
            <tr className="text-nowrap text-center">
              <th>선택</th>
              <th>진행일자</th>
              <th>업체명</th>
              <th>입금자명</th>
              <th>입금일</th>
              <th>세금계산서</th>
              <th>입금금액</th>
              <th>충전 가능 금액</th>
              <th>차감 금액</th>
              <th>결제방식</th>
              <th>처리방식</th>
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
            {depositData.map((row) => (
              <tr
                key={row.uuid}
                onClick={() => setSelectedRow(row)}
                style={{
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRow === row}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRow(row);
                      } else {
                        setSelectedRow(null);
                      }
                    }}
                  />
                </td>
                <td>{dayjs(row.progressDate).format("YYYY-MM-DD")}</td>
                <td>{row.company}</td>
                <td>{row.depositor}</td>
                <td>{dayjs(row.depositDate).format("YYYY-MM-DD")}</td>
                <td>{row.taxInvoice}</td>
                <td>{row.depositAmount?.toLocaleString()}</td>
                <td>{row.rechargeableAmount?.toLocaleString()}</td>
                <td>{row.deductAmount?.toLocaleString()}</td>
                <td>{row.paymentType}</td>
                <td>{row.processType}</td>
                {(() => {
                  const totals = row.charges?.reduce(
                    (acc, charge) => {
                      acc.naver += charge.naver || 0;
                      acc.gfa += charge.gfa || 0;
                      acc.kakao += charge.kakao || 0;
                      acc.moment += charge.moment || 0;
                      acc.google += charge.google || 0;
                      acc.carot += charge.carot || 0;
                      acc.nosp += charge.nosp || 0;
                      acc.meta += charge.meta || 0;
                      acc.dable += charge.dable || 0;
                      acc.remitPay += charge.remitPay || 0;
                      acc.netSales += charge.netSales || 0;
                      return acc;
                    },
                    {
                      naver: 0,
                      gfa: 0,
                      kakao: 0,
                      moment: 0,
                      google: 0,
                      carot: 0,
                      nosp: 0,
                      meta: 0,
                      dable: 0,
                      remitPay: 0,
                      netSales: 0,
                    }
                  );

                  return (
                    <>
                      <td>{totals?.naver.toLocaleString()}</td>
                      <td>{totals?.gfa.toLocaleString()}</td>
                      <td>{totals?.kakao.toLocaleString()}</td>
                      <td>{totals?.moment.toLocaleString()}</td>
                      <td>{totals?.google.toLocaleString()}</td>
                      <td>{totals?.carot.toLocaleString()}</td>
                      <td>{totals?.nosp.toLocaleString()}</td>
                      <td>{totals?.meta.toLocaleString()}</td>
                      <td>{totals?.dable.toLocaleString()}</td>
                      <td>{totals?.remitPay.toLocaleString()}</td>
                      <td>{totals?.netSales.toLocaleString()}</td>
                    </>
                  );
                })()}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div
          className="modal"
          style={{
            width: "500px",
            height: "300px",
            display: "block",
            position: "fixed",
            zIndex: 1050,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h5>삭제 확인</h5>
          <p>삭제하려면 "삭제"를 입력하세요.</p>
          <input
            type="text"
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            className="form-control mb-3"
            placeholder="삭제"
          />
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-secondary mr-2"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteInput(""); // 입력 초기화
              }}
            >
              취소
            </button>
            <button className="btn btn-danger" onClick={handleConfirmDelete}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposit;
