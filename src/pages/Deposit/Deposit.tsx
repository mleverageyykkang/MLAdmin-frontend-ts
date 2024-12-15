import React, { useState } from "react";
import dayjs from "dayjs";
import IDeposit, {
  paymentType,
  processType,
} from "../../common/models/deposit/IDeposit";

// 더미 데이터
const initialData: IDeposit[] = [
  {
    uuid: "deposit-1",
    marketerUid: "marketer-123",
    progressDate: new Date("2024-01-01"),
    company: "제이노블",
    depositor: "홍길동",
    depositDate: new Date("2024-01-02"),
    taxInvoice: "발행 완료",
    depositAmount: 1000000,
    deductAmount: 200000,
    processType: processType.DEFAULT,
    depositDueDate: new Date("2024-01-10"),
    paymentType: paymentType.TRANSFER,
    rechargeableAmount: 800000,
    deleteReason: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    charges: [
      {
        uuid: "charge-1",
        depositUuid: "deposit-1",
        naver: 300000,
        gfa: 100000,
        kakao: 150000,
        moment: 50000,
        google: 120000,
        carot: 80000,
        nosp: 40000,
        meta: 30000,
        dable: 20000,
        remitPay: 15000,
        netSales: 500000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    uuid: "deposit-2",
    marketerUid: "marketer-456",
    progressDate: new Date("2024-02-01"),
    company: "ABC Corp",
    depositor: "김철수",
    depositDate: new Date("2024-02-02"),
    taxInvoice: "미발행",
    depositAmount: 2000000,
    deductAmount: 400000,
    processType: processType.DEDUCT,
    depositDueDate: new Date("2024-02-10"),
    paymentType: paymentType.CARD,
    rechargeableAmount: 1600000,
    deleteReason: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    charges: [
      {
        uuid: "charge-2",
        depositUuid: "deposit-2",
        naver: 600000,
        gfa: 200000,
        kakao: 300000,
        moment: 100000,
        google: 240000,
        carot: 160000,
        nosp: 80000,
        meta: 60000,
        dable: 40000,
        remitPay: 30000,
        netSales: 1000000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
];

const Deposit: React.FC = () => {
  const [depositData, setDepositData] = useState<IDeposit[]>(initialData);
  const [selectedRow, setSelectedRow] = useState<IDeposit | null>(null);

  // 행 클릭 이벤트 처리
  const handleRowClick = (row: IDeposit) => {
    setSelectedRow({ ...row }); // 선택된 데이터 복사
  };

  // 입력값 변경 처리
  const handleInputChange = (
    field: string,
    value: string | number,
    isChargeField: boolean = false
  ) => {
    if (!selectedRow) return;

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
  };

  const inputStyle: React.CSSProperties = { width: "100%" };

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
        <label className="mr-2">이름:</label>
        <select className="mr-2">
          <option>마케터1</option>
          <option>마케터2</option>
        </select>
      </div>

      {/* 입금 테이블 */}
      <div className="ml-3">
        <h5>입금</h5>
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
            <tr>
              {[
                { field: "progressDate", value: selectedRow?.progressDate },
                { field: "company", value: selectedRow?.company },
                { field: "depositor", value: selectedRow?.depositor },
                { field: "depositDate", value: selectedRow?.depositDate },
                { field: "taxInvoice", value: selectedRow?.taxInvoice },
                { field: "depositAmount", value: selectedRow?.depositAmount },
                { field: "paymentType", value: selectedRow?.paymentType },
                { field: "processType", value: selectedRow?.processType },
              ].map(({ field, value }, index) => (
                <td key={index}>
                  <input
                    type="text"
                    style={inputStyle}
                    value={
                      value instanceof Date
                        ? dayjs(value).format("YYYY-MM-DD")
                        : value || ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        field,
                        field === "depositAmount"
                          ? parseInt(e.target.value.replace(/,/g, "")) || 0
                          : e.target.value,
                        false
                      )
                    }
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 충전 테이블 */}
      <div className="ml-3">
        <h5>충전</h5>
      </div>
      <div className="card-body table-full-width table-responsive border-bottom mb-4">
        <table className="table">
          <thead>
            <tr className="text-nowrap text-center">
              <th>충전 가능 금액</th>
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
            <tr>
              {[
                {
                  field: "rechargeableAmount",
                  value: selectedRow?.rechargeableAmount,
                },
                { field: "naver", value: selectedRow?.charges?.[0].naver },
                { field: "gfa", value: selectedRow?.charges?.[0].gfa },
                { field: "kakao", value: selectedRow?.charges?.[0].kakao },
                { field: "moment", value: selectedRow?.charges?.[0].moment },
                { field: "google", value: selectedRow?.charges?.[0].google },
                { field: "carot", value: selectedRow?.charges?.[0].carot },
                { field: "nosp", value: selectedRow?.charges?.[0].nosp },
                { field: "meta", value: selectedRow?.charges?.[0].meta },
                { field: "dable", value: selectedRow?.charges?.[0].dable },
                {
                  field: "remitPay",
                  value: selectedRow?.charges?.[0].remitPay,
                },
                {
                  field: "netSales",
                  value: selectedRow?.charges?.[0].netSales,
                },
              ].map(({ field, value }, index) => (
                <td key={index}>
                  <input
                    type="text"
                    style={inputStyle}
                    value={value?.toLocaleString() || ""}
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
          </tbody>
        </table>
      </div>

      {/* 리스트 테이블 */}
      <div className="mx-3 d-flex justify-content-between">
        <h5>리스트</h5>
      </div>
      <div className="card-body table-full-width table-responsive">
        <table className="table table-hover">
          <thead>
            <tr className="text-nowrap text-center">
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
                onClick={() => handleRowClick(row)}
                style={{ cursor: "pointer", whiteSpace: "nowrap" }}
              >
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
                <td>{row.charges?.[0].naver?.toLocaleString()}</td>
                <td>{row.charges?.[0].gfa?.toLocaleString()}</td>
                <td>{row.charges?.[0].kakao?.toLocaleString()}</td>
                <td>{row.charges?.[0].moment?.toLocaleString()}</td>
                <td>{row.charges?.[0].google?.toLocaleString()}</td>
                <td>{row.charges?.[0].carot?.toLocaleString()}</td>
                <td>{row.charges?.[0].nosp?.toLocaleString()}</td>
                <td>{row.charges?.[0].meta?.toLocaleString()}</td>
                <td>{row.charges?.[0].dable?.toLocaleString()}</td>
                <td>{row.charges?.[0].remitPay?.toLocaleString()}</td>
                <td>{row.charges?.[0].netSales?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Deposit;
