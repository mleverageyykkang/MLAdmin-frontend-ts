import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import IDeposit, {
  paymentType,
  processType,
} from "../../common/models/deposit/IDeposit";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "providers/authProvider";
import ICharge from "../../common/models/charge/ICharge";
import depositStyles from "./Deposit.module.scss";

interface User {
  uid: string;
  role: string;
}

const paymentTypeLabels: Record<string, string> = {
  card: "카드",
  transfer: "계좌이체",
};

const processTypeLabels: Record<string, string> = {
  default: "기본",
  precharge: "선충전",
  deduct: "차감",
  remitPayCo: "송금/결제(회사)",
  remitPayDe: "송금/결제(차감)",
};

const years = Array.from({ length: 6 }, (_, i) => dayjs().year() - 1 + i); // 연도 범위 생성 (현재 연도 +/- 5)
const months = Array.from({ length: 12 }, (_, i) => i + 1); // 월 범위 생성
const currentYear = 2024; //dayjs().year()
const currentMonth = 12; //dayjs().month() + 1

const Deposit: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
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
    deductAmount: 0,
    paymentType: "" as paymentType,
    processType: "" as processType,
    depositDueDate: new Date(),
    charges: [],
    rechargeableAmount: 0,
  });
  const [newCharge, setNewCharge] = useState({
    uuid: `temp-${Date.now()}`,
    createdAt: new Date(),
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
    note: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false); // 모달 상태
  const [deleteInput, setDeleteInput] = useState<string>(""); // 삭제 입력 값
  const [selectedCharge, setSelectedCharge] = useState<ICharge | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [marketerList, setMarketerList] = useState<
    { uid: string; name: string }[]
  >([]); // departmentUuid가 3인 데이터 목록
  const [selectedMarketer, setSelectedMarketer] = useState<string>(""); // 선택된 마케터 UID
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedView, setSelectedView] = useState<string>("");
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(
    null
  );
  const [useableAmounts, setUseableAmounts] = useState<
    { uuid: string; useableAmount: number }[]
  >([]);
  const [isAddingNewChargeRow, setIsAddingNewChargeRow] = useState(false); // 새로운 행 추가 상태

  const [columns, setColumns] = useState([
    { id: "progressDate", label: "진행일자", accessor: "progressDate" },
    { id: "company", label: "업체명", accessor: "company" },
    { id: "depositor", label: "입금자명", accessor: "depositor" },
    { id: "depositDate", label: "입금일", accessor: "depositDate" },
    { id: "taxInvoice", label: "세금계산서", accessor: "taxInvoice" },
    { id: "depositAmount", label: "입금금액", accessor: "depositAmount" },
    {
      id: "rechargeableAmount",
      label: "사용 가능 금액",
      accessor: "rechargeableAmount",
    },
    { id: "deductAmount", label: "차감 금액", accessor: "deductAmount" },
    { id: "paymentType", label: "결제방식", accessor: "paymentType" },
    { id: "processType", label: "처리방식", accessor: "processType" },

    // charges 내부 속성 추가
    { id: "naver", label: "네이버", accessor: "naverSum" },
    { id: "gfa", label: "네이버GFA", accessor: "gfaSum" },
    { id: "kakao", label: "카카오", accessor: "kakaoSum" },
    { id: "moment", label: "카카오모먼트", accessor: "momentSum" },
    { id: "google", label: "구글", accessor: "googleSum" },
    { id: "carot", label: "당근", accessor: "carotSum" },
    { id: "nosp", label: "네이버NOSP", accessor: "nospSum" },
    { id: "meta", label: "메타", accessor: "metaSum" },
    { id: "dable", label: "데이블", accessor: "dableSum" },
    { id: "remitPay", label: "송금/결제", accessor: "remitPaySum" },
    { id: "netSales", label: "순매출", accessor: "netSalesSum" },
    { id: "note", label: "비고", accessor: "charges.note" },
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
    setDraggedColumnIndex(null); // Reset dragged index
  };

  //role 확인
  const fetchUserRole = async () => {
    try {
      const response = await axios.get("/user", {
        withCredentials: true,
      });
      const user: User = response.data.context.user;
      setUserRole(user.role);
      setUserId(user.uid);
      // system 이나 admin 일 때, 마케터 목록 가져오기
      if (user.role === "admin" || user.role === "system") {
        const marketerResponse = response.data.body;
        const marketers = marketerResponse
          .filter((marketer: any) => marketer.departmentUuid === "3")
          .map((maketer: any) => ({ uid: maketer.uid, name: maketer.name }));
        setMarketerList(marketers);
        if (marketerList.length >= 0 && !selectedMarketer) {
          setSelectedMarketer(marketers[0].uid);
        }
      }
    } catch (err) {
      console.error("로그인한 유저 정보 로드 실패:", err);
    }
  };

  //전체입금내역 불러오기
  const getDeposits = async (marketerUid = "") => {
    try {
      const url = `/sheet/deposit?marketerUid=${marketerUid}&status=${selectedView}&year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      setDepositData(response.data.body);
      const filtered = response.data.body.map((item: any) => ({
        uuid: item.uuid,
        useableAmount: item.rechargeableAmount,
      }));
      setUseableAmounts(filtered);
      if (response.status === 203) console.error(response.data.body);
    } catch (error) {
      console.error("Failed to get DepositData: ", error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      await fetchUserRole(); // userRole과 userId를 설정
      if (userRole && userId) {
        // userRole에 따라 적절한 데이터를 가져옴
        if (userRole === "user") {
          getDeposits(userId); // userId로 데이터를 가져옴
        } else if (userRole === "admin" || userRole === "system") {
          if (selectedMarketer) {
            getDeposits(selectedMarketer); // selectedMarketer로 데이터를 가져옴
          }
        }
      }
    };
    initializeData();
  }, [
    selectedView,
    selectedMarketer,
    userRole,
    userId,
    selectedYear,
    selectedMonth,
  ]);

  // 마케터 필터 변경 처리
  const handleMarketerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const marketerUid = e.target.value;
    setSelectedMarketer(marketerUid);
    getDeposits(marketerUid); // 적용된 데이터 가져오기
  };

  // 저장 버튼 활성화 여부 관리
  useEffect(() => {
    if (!selectedRow) {
      setIsSaveDisabled(true);
      return;
    }
    const originalData = depositData.find(
      (deposit) => deposit.uuid === selectedRow.uuid
    );
    if (originalData) {
      const isChanged =
        JSON.stringify(originalData) !== JSON.stringify(selectedRow);
      setIsSaveDisabled(!isChanged);
    }
  }, [selectedRow, depositData]);

  if (userRole === null) {
    return <div>Loading...</div>; // 사용자 역할 로딩 중
  }

  // 입력값 변경 처리
  const handleInputChange = (
    field: string,
    value: string | number | Date,
    isChargeField: boolean = false
  ) => {
    if (selectedRow) {
      if (isChargeField && selectedCharge) {
        // 충전 테이블의 특정 행 수정
        const updatedCharges = selectedRow.charges?.map((charge: any) => {
          if (charge.uuid === selectedCharge.uuid) {
            const previousValue = (charge[field] as number) || 0; // 기존 값
            const newValue = typeof value === "number" ? value : 0; // 새 값
            const delta = newValue - previousValue; // 차이 계산

            // useableAmounts 업데이트
            setUseableAmounts((prevAmounts) => {
              const updatedAmounts = [...prevAmounts];
              const existingEntryIndex = updatedAmounts.findIndex(
                (entry) => entry.uuid === selectedRow.uuid
              );

              if (existingEntryIndex !== -1) {
                updatedAmounts[existingEntryIndex] = {
                  ...updatedAmounts[existingEntryIndex],
                  useableAmount:
                    updatedAmounts[existingEntryIndex].useableAmount - delta, // 차이 반영
                };
              }
              return updatedAmounts;
            });

            // 필드 업데이트
            return { ...charge, [field]: value };
          }
          return charge;
        });

        setSelectedRow((prev) =>
          prev
            ? {
                ...prev,
                charges: updatedCharges,
              }
            : null
        );

        setSelectedCharge((prev) =>
          prev ? { ...prev, [field]: value } : null
        ); // 선택된 charge 업데이트
      } else {
        // 일반 입력 필드 수정
        setSelectedRow((prev) => (prev ? { ...prev, [field]: value } : null));
      }
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
      let requestData;
      if (newDeposit.processType !== processType.PRECHARGE) {
        const { uuid, depositDueDate, ...rest } = newDeposit;
        requestData = { ...rest };
      } else {
        const { uuid, ...rest } = newDeposit;
        requestData = { ...rest };
      }
      const response = await axios.post("/sheet/deposit", requestData, {
        withCredentials: true,
      });

      // 성공적으로 등록한 경우 테이블 업데이트
      setDepositData((prev) => [response.data, ...prev]);
      if (userRole && userId) {
        // userRole에 따라 적절한 데이터를 가져옴
        if (userRole === "user") {
          getDeposits(userId); // userId로 데이터를 가져옴
        } else if (userRole === "admin" || userRole === "system") {
          if (selectedMarketer) {
            getDeposits(selectedMarketer); // selectedMarketer로 데이터를 가져옴
          }
        }
      }
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
    } catch (error: any) {
      console.error("등록 실패:", error);
      alert(
        error.response?.data?.result?.message || "입금 등록에 실패했습니다."
      );
    }
  };

  const handleDepositCancelClick = () => {
    if (selectedRow) {
      setSelectedRow(null);
    } else {
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
    }
  };

  const handleChargeCancelClick = () => {
    if (selectedRow) {
      if (selectedCharge) {
        // 기존 데이터 수정 취소
        const original = depositData.find(
          (deposit) => deposit.uuid === selectedRow.uuid
        );
        const originalCharge = original?.charges?.find(
          (charge) => charge.uuid === selectedCharge.uuid
        );
        if (originalCharge) {
          // 기존 값과 수정된 값의 차이를 계산
          const delta = Object.keys(originalCharge).reduce((sum, key) => {
            if (typeof originalCharge[key as keyof ICharge] === "number") {
              const originalValue = originalCharge[
                key as keyof ICharge
              ] as number;
              const currentValue = selectedCharge[
                key as keyof ICharge
              ] as number;

              return sum + (currentValue - originalValue);
            }
            return sum;
          }, 0);
          // `useableAmounts` 복원
          setUseableAmounts((prevAmounts) => {
            const updatedAmounts = [...prevAmounts];
            const existingEntryIndex = updatedAmounts.findIndex(
              (entry) => entry.uuid === selectedRow.uuid
            );
            if (existingEntryIndex !== -1) {
              updatedAmounts[existingEntryIndex] = {
                ...updatedAmounts[existingEntryIndex],
                useableAmount:
                  (updatedAmounts[existingEntryIndex]?.useableAmount || 0) +
                  delta, // 수정된 값 복원
              };
            }

            return updatedAmounts;
          });
          // `selectedRow` 상태 복원
          setSelectedRow((prev) =>
            prev
              ? {
                  ...prev,
                  charges: prev.charges?.map((charge) =>
                    charge.uuid === selectedCharge.uuid
                      ? originalCharge
                      : charge
                  ),
                }
              : null
          );
        }
        setSelectedCharge(null); // 선택 초기화
      }

      // 새로운 데이터 등록 취소
      const numericFieldsSum = Object.entries(newCharge)
        .filter(([key, value]) => typeof value === "number")
        .reduce((sum, [, value]) => sum + (value as number), 0);

      // `useableAmounts` 복원
      setUseableAmounts((prevAmounts) => {
        const updatedAmounts = [...prevAmounts];
        const existingEntryIndex = updatedAmounts.findIndex(
          (entry) => entry.uuid === selectedRow.uuid
        );

        if (existingEntryIndex !== -1) {
          updatedAmounts[existingEntryIndex] = {
            ...updatedAmounts[existingEntryIndex],
            useableAmount:
              (updatedAmounts[existingEntryIndex]?.useableAmount || 0) +
              numericFieldsSum,
          };
        }

        return updatedAmounts;
      });
      setIsAddingNewChargeRow(false);

      // 새로운 충전 데이터 초기화
      setNewCharge({
        uuid: `temp-${Date.now()}`,
        createdAt: new Date(),
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
        note: "",
      });
    }
  };

  const handleAddNewCharge = () => {
    setIsAddingNewChargeRow(true);
    const EntryIndex = useableAmounts.findIndex(
      (entry) => entry.uuid === selectedRow?.uuid
    );
    if (EntryIndex !== -1) {
      if (useableAmounts[EntryIndex]?.useableAmount <= 0) {
        alert("사용 가능 금액을 확인하세요!");
        setIsAddingNewChargeRow(false);
      }
    }
  };

  const handleRegisterCharge = async () => {
    const { uuid, ...requestData } = newCharge; // uuid를 제외하고 전송
    try {
      const response = await axios.post(
        `/sheet/deposit/${selectedRow?.uuid}/charge`,
        requestData,
        { withCredentials: true }
      );
      // 서버에서 최신 충전 데이터를 가져옴
      const chargesResponse = await axios.get(
        `/sheet/deposit/${selectedRow?.uuid}/charge`,
        { withCredentials: true }
      );
      const updatedCharges = chargesResponse.data.body.charges; // 최신 충전 데이터
      const updatedRechargeableAmount =
        chargesResponse.data.body.rechargeableAmount;
      // 선택된 행 업데이트
      setSelectedRow((prev) =>
        prev
          ? {
              ...prev,
              charges: updatedCharges, // 충전 데이터 동기화
              rechargeableAmount: updatedRechargeableAmount,
            }
          : null
      );
      // 전체 depositData 상태 업데이트
      setDepositData((prevData) =>
        prevData.map((deposit) =>
          deposit.uuid === selectedRow?.uuid
            ? { ...deposit, charges: updatedCharges } // 충전 데이터 동기화
            : deposit
        )
      );
      if (userRole && userId) {
        // userRole에 따라 적절한 데이터를 가져옴
        if (userRole === "user") {
          getDeposits(userId); // userId로 데이터를 가져옴
        } else if (userRole === "admin" || userRole === "system") {
          if (selectedMarketer) {
            getDeposits(selectedMarketer); // selectedMarketer로 데이터를 가져옴
          }
        }
      }

      // 충전 테이블에 새로운 데이터가 바로 보이도록 상태 초기화 및 UI 갱신
      setNewCharge({
        uuid: `temp-${Date.now()}`,
        createdAt: new Date(),
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
        note: "",
      });

      alert("충전이 등록되었습니다.");
    } catch (error: any) {
      console.error("Failed to Charge:", error);
      alert(
        error.response?.data?.result?.message ||
          "충전 데이터를 등록하는 데 실패했습니다."
      );
    }
  };

  // 삭제 버튼 클릭 -> 모달 표시
  const handleDeleteClick = () => {
    if (!selectedRow) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }
    setShowDeleteModal(true); // 모달 열기
  };

  // 모달에서 삭제 수행
  const handleConfirmDelete = async () => {
    if (deleteInput !== "삭제") {
      alert("삭제를 정확히 입력해주세요.");
      return;
    }
    try {
      await axios.delete(`/sheet/deposit/${selectedRow?.uuid}`, {
        data: { deleteReason: deleteInput }, // "삭제" 입력값 request body로 전달
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      alert("선택한 항목이 삭제되었습니다.");
      setDepositData((prevData) =>
        prevData.filter((row) => row.uuid !== selectedRow?.uuid)
      );
      setSelectedRow(null); // 선택 초기화
      setShowDeleteModal(false); // 모달 닫기
      setDeleteInput(""); // 입력 초기화
    } catch (error: any) {
      console.error("삭제 실패:", error);
      alert(
        error.response?.data?.result?.message ||
          "삭제 중 문제가가 발생하였습니다."
      );
    }
  };

  // 충전 테이블 체크박스 관리
  const handleChargeCheckboxChange = (charge: ICharge) => {
    setSelectedCharge((prev) => (prev?.uuid === charge.uuid ? null : charge)); //이미 선택시 해제
  };

  // 충전 정보 삭제
  const handleChargeDelete = async () => {
    if (window.confirm("선택한 충전 항목을 삭제하시겠습니까?")) {
      try {
        // 삭제 API 호출
        await axios.delete(
          `/sheet/deposit/${selectedRow?.uuid}/charge/${selectedCharge?.uuid}`,
          { withCredentials: true }
        );
        // 서버에서 최신 충전 데이터를 가져옴
        const chargesResponse = await axios.get(
          `/sheet/deposit/${selectedRow?.uuid}/charge`,
          { withCredentials: true }
        );
        const updatedCharges = chargesResponse.data.body.charges; // 최신 충전 데이터
        const updatedRechargeableAmount =
          chargesResponse.data.body.rechargeableAmount;

        // 선택된 행 업데이트
        setSelectedRow((prev) =>
          prev
            ? {
                ...prev,
                charges: updatedCharges, // 충전 데이터 동기화
                rechargeableAmount: updatedRechargeableAmount,
              }
            : null
        );
        // 전체 depositData 상태 업데이트
        setDepositData((prevData) =>
          prevData.map((deposit) =>
            deposit.uuid === selectedRow?.uuid
              ? { ...deposit, charges: updatedCharges } // 충전 데이터 동기화
              : deposit
          )
        );
        // 전체 입금 데이터 서버에서 동기화
        if (userRole && userId) {
          // userRole에 따라 적절한 데이터를 가져옴
          if (userRole === "user") {
            getDeposits(userId); // userId로 데이터를 가져옴
          } else if (userRole === "admin" || userRole === "system") {
            if (selectedMarketer) {
              getDeposits(selectedMarketer); // selectedMarketer로 데이터를 가져옴
            }
          }
        }
        setSelectedCharge(null); // 상태 초기화
        alert("선택한 충전 데이터가 삭제되었습니다.");
      } catch (error: any) {
        console.error("충전 데이터 삭제 실패:", error);
        alert(
          error.response?.data?.result?.message ||
            "충전 데이터를 삭제하는데 실패했습니다."
        );
      }
    }
  };

  // 입금 테이블 수정
  const handleDepositSaveClick = async () => {
    if (!selectedRow) return;
    if (window.confirm("수정한 입금 정보를 저장하시겠습니까?")) {
      try {
        const { uuid, ...updatedData } = selectedRow; // uuid 제외
        const response = await axios.put(
          `/sheet/deposit/${uuid}`,
          updatedData,
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          alert("입금 데이터가 성공적으로 수정되었습니다.");
          const updatedDeposit = response.data;
          // 데이터 업데이트
          setDepositData((prevData) =>
            prevData.map((deposit) =>
              deposit.uuid === uuid
                ? { ...deposit, ...updatedDeposit }
                : deposit
            )
          );
          // 서버에서 최신 데이터를 가져와 동기화
          if (userRole && userId) {
            // userRole에 따라 적절한 데이터를 가져옴
            if (userRole === "user") {
              getDeposits(userId); // userId로 데이터를 가져옴
            } else if (userRole === "admin" || userRole === "system") {
              if (selectedMarketer) {
                getDeposits(selectedMarketer); // selectedMarketer로 데이터를 가져옴
              }
            }
          }
          setSelectedRow(null);
        }
      } catch (error: any) {
        console.error("입금 데이터 수정 실패:", error);
        alert(
          error.response?.data?.result?.message || "입금 수정을 실패했습니다."
        );
      }
    }
  };

  // 충전 테이블 수정
  const handleChargeSaveClick = async () => {
    if (!selectedCharge) {
      alert("수정할 충전 정보를 선택해주세요.");
      return;
    }
    if (window.confirm("수정한 충전 정보를 저장하시겠습니까?")) {
      try {
        // 기존 값 찾기
        const original = depositData.find(
          (deposit) => deposit.uuid === selectedRow?.uuid
        );
        const originalCharge: any = original?.charges?.find(
          (charge) => charge.uuid === selectedCharge.uuid
        );

        if (!originalCharge) {
          alert("기존 데이터를 찾을 수 없습니다.");
          return;
        }

        // 변경된 값만 추출
        const updatedFields = Object.entries(selectedCharge).reduce(
          (acc: any, [key, value]) => {
            if (value !== originalCharge[key as keyof ICharge]) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Partial<typeof selectedCharge>
        );
        // 변경된 값이 없으면 종료
        if (Object.keys(updatedFields).length === 0) {
          alert("수정된 내용이 없습니다.");
          return;
        }
        // 변경된 값에 기존 값 합치기기
        const finalFields = {
          ...originalCharge,
          ...updatedFields,
        };

        // API 요청
        const response = await axios.put(
          `/sheet/deposit/${selectedRow?.uuid}/charge/${selectedCharge.uuid}`,
          finalFields,
          { withCredentials: true }
        );

        // 서버 응답 데이터로 업데이트
        if (response.status === 200) {
          // 서버에서 최신 충전 데이터를 가져옴
          const chargesResponse = await axios.get(
            `/sheet/deposit/${selectedRow?.uuid}/charge`,
            { withCredentials: true }
          );
          const updatedCharges = chargesResponse.data.body.charges; // 최신 충전 데이터
          const updatedRechargeableAmount =
            chargesResponse.data.body.rechargeableAmount;

          // 선택된 행 업데이트
          setSelectedRow((prev) =>
            prev
              ? {
                  ...prev,
                  charges: updatedCharges, // 충전 데이터 동기화
                  rechargeableAmount: updatedRechargeableAmount,
                }
              : null
          );

          // 전체 depositData 상태 업데이트
          setDepositData((prevData) =>
            prevData.map((deposit) =>
              deposit.uuid === selectedRow?.uuid
                ? { ...deposit, charges: updatedCharges } // 충전 데이터 동기화
                : deposit
            )
          );
          if (userRole && userId) {
            // userRole에 따라 적절한 데이터를 가져옴
            if (userRole === "user") {
              getDeposits(userId); // userId로 데이터를 가져옴
            } else if (userRole === "admin" || userRole === "system") {
              if (selectedMarketer) {
                getDeposits(selectedMarketer); // selectedMarketer로 데이터를 가져옴
              }
            }
          }
          setSelectedCharge(null); // 수정 완료 후 초기화
          alert("충전 정보가 수정되었습니다.");
        }
      } catch (error: any) {
        console.error("충전 정보 수정 실패:", error);
        alert(
          error.response?.data?.result?.message ||
            "충전 정보를 수정하는데 실패했습니다."
        );
      }
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  const handleViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedView(e.target.value);
  };

  return (
    <div>
      {/* 필터 */}
      <div className="mb-4">
        <label className="mr-2">기간</label>
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="mr-2"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}년
            </option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="mr-2"
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {month}월
            </option>
          ))}
        </select>
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

      {/* 입금 테이블 */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5>입금</h5>
        <div>
          {selectedRow ? (
            <button
              className="btn btn-primary mr-2"
              onClick={handleDepositSaveClick}
              disabled={isSaveDisabled}
            >
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
          <button
            className="btn btn-secondary"
            onClick={handleDepositCancelClick}
          >
            취소
          </button>
        </div>
      </div>
      <div className="table-full-width px-0 table-responsive">
        <table className="table">
          <thead>
            <tr className="text-nowrap text-center">
              <th>진행일자</th>
              <th>업체명</th>
              <th>입금자명</th>
              <th>입금일</th>
              <th>세금계산서</th>
              <th>입금액</th>
              <th>차감액</th>
              <th>결제방식</th>
              <th>처리방식</th>
              <th>입금예정일</th>
            </tr>
          </thead>
          <tbody>
            {selectedRow ? (
              // 수정 모드
              <tr>
                {[
                  { field: "progressDate", value: selectedRow.progressDate },
                  { field: "company", value: selectedRow.company },
                  { field: "depositor", value: selectedRow.depositor },
                  { field: "depositDate", value: selectedRow.depositDate },
                  { field: "taxInvoice", value: selectedRow.taxInvoice },
                  { field: "depositAmount", value: selectedRow.depositAmount },
                  { field: "deductAmount", value: selectedRow.deductAmount },
                  { field: "paymentType", value: selectedRow.paymentType },
                  { field: "processType", value: selectedRow.processType },
                  {
                    field: "depositDueDate",
                    value: selectedRow.depositDueDate,
                  },
                ].map(({ field, value }, index) => (
                  <td key={index}>
                    {field === "paymentType" ? (
                      <select
                        className="w-100"
                        value={value?.toLocaleString("") || ""}
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            e.target.value
                          )
                        }
                      >
                        <option value="">선택</option>
                        <option value="CARD">카드</option>
                        <option value="TRANSFER">계좌이체</option>
                      </select>
                    ) : field === "processType" ? (
                      <select
                        className="w-100"
                        value={value?.toLocaleString("") || ""}
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            e.target.value
                          )
                        }
                      >
                        <option value="">선택</option>
                        <option value={processType.DEFAULT}>기본</option>
                        <option value={processType.PRECHARGE}>선충전</option>
                        <option value={processType.DEDUCT}>차감</option>
                        <option value={processType.REMITPAYCO}>
                          송금/결제(회사)
                        </option>
                        <option value={processType.REMITPAYDE}>
                          송금/결제(차감)
                        </option>
                      </select>
                    ) : field === "deductAmount" ? (
                      <input
                        type="text"
                        className="w-100"
                        value={Number(value) || ""}
                        disabled={
                          selectedRow.processType !== processType.DEDUCT
                        } // 조건부 비활성화
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    ) : field === "depositDueDate" ? (
                      <input
                        type="date"
                        className="w-100"
                        value={
                          value instanceof Date
                            ? dayjs(value).format("YYYY-MM-DD")
                            : value || ""
                        }
                        disabled={
                          selectedRow.processType !== processType.PRECHARGE
                        } // 조건부 비활성화
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            new Date(e.target.value)
                          )
                        }
                      />
                    ) : (
                      <input
                        type={
                          field === "progressDate" || field === "depositDate"
                            ? "date"
                            : "text"
                        }
                        className="w-100"
                        value={
                          field === "progressDate" || field === "depositDate"
                            ? dayjs(value).format("YYYY-MM-DD")
                            : value?.toLocaleString("") || ""
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
                  { field: "deductAmount", value: newDeposit.deductAmount },
                  { field: "paymentType", value: newDeposit.paymentType },
                  { field: "processType", value: newDeposit.processType },
                  { field: "depositDueDate", value: newDeposit.depositDueDate },
                ].map(({ field, value }, index) => (
                  <td key={index}>
                    {field === "paymentType" ? (
                      <select
                        className="w-100"
                        value={value?.toLocaleString("") || ""}
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            e.target.value
                          )
                        }
                      >
                        <option value="">선택</option>
                        <option value="CARD">카드</option>
                        <option value="TRANSFER">계좌이체</option>
                      </select>
                    ) : field === "processType" ? (
                      <select
                        className="w-100"
                        value={value?.toLocaleString("") || ""}
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            e.target.value
                          )
                        }
                      >
                        <option value="">선택</option>
                        <option value={processType.DEFAULT}>기본</option>
                        <option value={processType.PRECHARGE}>선충전</option>
                        <option value={processType.DEDUCT}>차감</option>
                        <option value={processType.REMITPAYCO}>
                          송금/결제(회사)
                        </option>
                        <option value={processType.REMITPAYDE}>
                          송금/결제(차감)
                        </option>
                      </select>
                    ) : field === "deductAmount" ? (
                      <input
                        type="text"
                        className="w-100"
                        value={Number(value) || ""}
                        disabled={newDeposit.processType !== processType.DEDUCT} // 조건부 비활성화
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    ) : field === "depositDueDate" ? (
                      <input
                        type="date"
                        className="w-100 text-center"
                        value={
                          value instanceof Date
                            ? dayjs(value).format("YYYY-MM-DD")
                            : value || ""
                        }
                        disabled={
                          newDeposit.processType !== processType.PRECHARGE
                        } // 조건부 비활성화
                        onChange={(e) =>
                          handleInputChange(
                            field as keyof IDeposit,
                            new Date(e.target.value)
                          )
                        }
                      />
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
      <div className="d-flex justify-content-between my-3">
        <div>
          <h5>
            충전 - 사용가능금액 :{" "}
            <span
              style={{
                color:
                  (useableAmounts.find(
                    (entry) => entry.uuid === selectedRow?.uuid
                  )?.useableAmount ?? 0) < 0
                    ? "red"
                    : "black",
              }}
            >
              {useableAmounts
                .find((entry) => entry.uuid === selectedRow?.uuid)
                ?.useableAmount?.toLocaleString()}{" "}
              원
            </span>
          </h5>
        </div>
        {selectedRow && (
          <div>
            {selectedCharge && (
              <>
                <button
                  className="btn btn-primary mr-2"
                  onClick={handleChargeSaveClick}
                >
                  저장
                </button>
                <button
                  className="btn btn-danger mr-2"
                  onClick={handleChargeDelete}
                >
                  삭제
                </button>
              </>
            )}
            {isAddingNewChargeRow ? (
              <button
                className="btn btn-success mr-2"
                onClick={handleRegisterCharge}
              >
                등록
              </button>
            ) : (
              <button
                className="btn btn-success mr-2"
                onClick={handleAddNewCharge}
              >
                추가
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={handleChargeCancelClick}
            >
              취소
            </button>
          </div>
        )}
      </div>
      <div className="table-full-width px-0 table-responsive border-bottom pb-3">
        <table className="table">
          <thead>
            <tr className="text-nowrap text-center">
              <th>선택</th>
              <th>등록일</th>
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
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {/* 충전테이블 새 행 추가 모드 */}
            {isAddingNewChargeRow ? (
              <tr>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={selectedCharge?.uuid !== newCharge.uuid}
                    disabled={selectedCharge?.uuid !== newCharge.uuid}
                    onChange={() => handleChargeCheckboxChange(newCharge)}
                  />
                </td>
                {[
                  { field: "createdAt", value: newCharge.createdAt },
                  { field: "naver", value: newCharge.naver },
                  { field: "gfa", value: newCharge.gfa },
                  { field: "kakao", value: newCharge.kakao },
                  { field: "moment", value: newCharge.moment },
                  { field: "google", value: newCharge.google },
                  { field: "carot", value: newCharge.carot },
                  { field: "nosp", value: newCharge.nosp },
                  { field: "meta", value: newCharge.meta },
                  { field: "dable", value: newCharge.dable },
                  {
                    field: "remitPay",
                    value: newCharge.remitPay,
                    isRemitPayField: true, // 송금/결제 여부 플래그
                  },
                  { field: "netSales", value: newCharge.netSales },
                  { field: "note", value: newCharge.note, isStringField: true }, // 문자열 필드 플래그 추가
                ].map(
                  ({ field, value, isRemitPayField, isStringField }, index) => (
                    <td key={`new-${field}-${index}`}>
                      <input
                        type={field === "createdAt" ? "date" : "text"} // 날짜 필드 처리
                        className="w-100"
                        value={
                          field === "createdAt" && value instanceof Date
                            ? dayjs(value).format("YYYY-MM-DD")
                            : value?.toLocaleString() || ""
                        }
                        disabled={
                          !selectedRow || // selectedRow가 없으면 비활성화
                          (isRemitPayField &&
                            selectedRow?.processType !==
                              processType.REMITPAYCO &&
                            selectedRow?.processType !== processType.REMITPAYDE) // remitPay 조건 처리
                        }
                        onChange={(e) => {
                          setNewCharge((prev) => {
                            const updatedCharge = {
                              ...prev,
                              [field]: isStringField
                                ? e.target.value // 문자열 필드 처리
                                : parseInt(e.target.value.replace(/,/g, "")) ||
                                  0,
                            };

                            // 숫자 필드 합산 로직
                            const numericFieldsSum = Object.entries(
                              updatedCharge
                            )
                              .filter(
                                ([key, value]) => typeof value === "number"
                              ) // 숫자 타입 필터링
                              .reduce(
                                (sum, [, value]) => sum + (value as number),
                                0
                              ); // 값 합산 (타입 단언)

                            // useableAmounts 업데이트 로직
                            if (selectedRow?.uuid) {
                              setUseableAmounts((prevAmounts) => {
                                const updatedAmounts = [...prevAmounts];
                                const existingEntryIndex =
                                  updatedAmounts.findIndex(
                                    (entry) => entry.uuid === selectedRow.uuid
                                  );

                                const useableAmount =
                                  (selectedRow.rechargeableAmount || 0) -
                                  numericFieldsSum;

                                if (existingEntryIndex !== -1) {
                                  // 기존 항목 업데이트
                                  updatedAmounts[existingEntryIndex] = {
                                    ...updatedAmounts[existingEntryIndex],
                                    useableAmount,
                                  };
                                }
                                return updatedAmounts;
                              });
                            }
                            return updatedCharge; // 상태 업데이트
                          });
                        }}
                      />
                    </td>
                  )
                )}
              </tr>
            ) : (
              <>
                {!selectedRow && (
                  <tr>
                    <td colSpan={14} className="text-secondary text-center">
                      리스트 내역을 선택해주세요.
                    </td>
                  </tr>
                )}
              </>
            )}
            {/* 충전테이블 기존 행 수정 모드 */}
            {selectedRow?.charges?.map((charge, chargeIndex) => (
              <tr
                key={charge.uuid || chargeIndex}
                style={{
                  backgroundColor:
                    selectedCharge?.uuid === charge?.uuid
                      ? "#f8f9fa"
                      : "transparent",
                }}
              >
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={selectedCharge?.uuid === charge.uuid} // 선택된 데이터 체크
                    onChange={() => handleChargeCheckboxChange(charge)} // 객체 전달
                  />
                </td>
                {[
                  { field: "createdAt", value: charge.createdAt },
                  { field: "naver", value: charge.naver },
                  { field: "gfa", value: charge.gfa },
                  { field: "kakao", value: charge.kakao },
                  { field: "moment", value: charge.moment },
                  { field: "google", value: charge.google },
                  { field: "carot", value: charge.carot },
                  { field: "nosp", value: charge.nosp },
                  { field: "meta", value: charge.meta },
                  { field: "dable", value: charge.dable },
                  {
                    field: "remitPay",
                    value: charge.remitPay,
                    isRemitPayField: true, // 송금/결제 여부 플래그
                  },
                  { field: "netSales", value: charge.netSales },
                  { field: "note", value: charge.note, isStringField: true }, // 문자열 필드 플래그 추가
                ].map(
                  ({ field, value, isRemitPayField, isStringField }, index) => (
                    <td key={`${charge.uuid}-${index}`}>
                      <input
                        type={field === "createdAt" ? "text" : "text"} // 날짜 필드 처리
                        className="w-100"
                        value={
                          field === "createdAt"
                            ? dayjs(value).format("YYYY-MM-DD")
                            : value?.toLocaleString("") || ""
                        }
                        disabled={
                          selectedCharge?.uuid !== charge.uuid ||
                          // selectedRow가 없으면 비활성화
                          (isRemitPayField &&
                            selectedRow?.processType !==
                              processType.REMITPAYCO &&
                            selectedRow?.processType !== processType.REMITPAYDE) // remitPay 조건 처리
                        }
                        onChange={(e) =>
                          handleInputChange(
                            field,
                            isStringField
                              ? e.target.value
                              : parseInt(e.target.value.replace(/,/g, "")) || 0, // 문자열 필드 처리
                            true
                          )
                        }
                      />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 리스트 테이블 */}
      <div className="d-flex justify-content-between my-4">
        <h5> 리스트 </h5>
        <div className="align-items-center d-flex">
          <button className="btn btn-danger mr-2" onClick={handleDeleteClick}>
            삭제
          </button>
          <select
            className="h-100"
            value={selectedView}
            onChange={handleViewChange}
          >
            전체
            <option value="">전체</option>
            <option value="progress">진행중</option>
            <option value="complete">완료</option>
            <option value="refund">환불</option>
          </select>
        </div>
      </div>
      <div
        className={`${depositStyles.depositTable} table-full-width px-0 table-responsive`}
        style={{ overflow: "auto", maxHeight: "740px" }}
      >
        <table className="table table-bordered">
          <thead>
            <tr className="text-nowrap">
              <th style={{ backgroundColor: "#f8f9fa" }}>선택</th>
              {columns.map((column, index) => (
                <th
                  key={column.id}
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
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(depositData) && depositData.length > 0 ? (
              depositData.map((row: any, rowIndex) => (
                <tr
                  key={row.uuid}
                  onClick={() => {
                    setSelectedRow(row);
                  }}
                  style={{
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                    color: row.rechargeableAmount === 0 ? "#FFC0CB" : "inherit",
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
                  {columns.map((column) => (
                    <td
                      key={`cell-${rowIndex}-${column.id}`}
                      style={{ textAlign: "center" }}
                    >
                      {column.accessor === "progressDate" ||
                      column.accessor === "depositDate"
                        ? row[column.accessor]
                          ? dayjs(row[column.accessor]).format("YYYY-MM-DD")
                          : "-"
                        : column.accessor === "processType"
                        ? processTypeLabels[row[column.accessor]] ||
                          row[column.accessor]
                        : column.accessor === "paymentType"
                        ? paymentTypeLabels[row[column.accessor]] ||
                          row[column.accessor]
                        : row[column.accessor]?.toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={23} className="text-secondary">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
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
          <h5 className="text-center mb-4">삭제 확인</h5>
          <p>삭제하려면 "삭제"를 입력하세요.</p>
          <input
            type="text"
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            className="form-control mb-3"
            placeholder="삭제"
          />
          <div className="d-flex justify-content-end ">
            <button
              className="btn btn-danger mr-2"
              onClick={handleConfirmDelete}
              disabled={deleteInput !== "삭제"}
            >
              확인
            </button>
            <button
              className="btn btn-secondary "
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteInput(""); // 입력 초기화
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposit;