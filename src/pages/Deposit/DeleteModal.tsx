import dayjs from "dayjs";
import IMediaViral from "../../common/models/mediaViral/IMediaViral";
import { useState } from "react";
import axios from "axios";
import IDeposit from "../../common/models/deposit/IDeposit";
interface DeleteModalProps {
  selectedRow: IDeposit | null;
  setDepositData: React.Dispatch<React.SetStateAction<IDeposit[]>>;
  setSelectedRow: React.Dispatch<React.SetStateAction<IDeposit | null>>;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const DeleteModal: React.FC<DeleteModalProps> = ({
  selectedRow,
  setSelectedRow,
  setDepositData,
  setShowDeleteModal,
}) => {
  const [deleteInput, setDeleteInput] = useState<string>(""); // 삭제 입력 값
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
  return (
    <>
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
              setSelectedRow(null);
            }}
          >
            취소
          </button>
        </div>
      </div>
    </>
  );
};
export default DeleteModal;
