import dayjs from "dayjs";
import IMediaViral from "../../common/models/mediaViral/IMediaViral";
interface UnmappedModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  unmappedAccounts: any;
}
const UnmappedModal: React.FC<UnmappedModalProps> = ({
  showModal,
  setShowModal,
  unmappedAccounts,
}) => {
  return (
    <>
      <div>
        <div
          className="modal"
          style={{
            width: "500px",
            height: "500px",
            display: "block",
            position: "fixed",
            zIndex: 9999,
            top: "50%",
            left: "58%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
          }}
        >
          {unmappedAccounts.map((item: any) => (
            <>
              <div className="text-center mt-5 mb-5">
                <h5>미지정 계정 확인</h5>
                <p>신규 미지정 계정</p>
              </div>
              <div>미지정 계정 매체 : {item.media}</div>
              <div>미지정 계정 고객명 : {item.clientName}</div>
              <div>미지정 계정 고객 ID : {item.clientId}</div>
              <div>미지정 계정 광고비 : {item.advCost}</div>
              <div>
                년월 : {dayjs(item.monthDate).format("YYYY년 MM월 DD일")}
              </div>
              <div className="d-flex justify-content-center mt-5">
                <button
                  className="btn btn-secondary "
                  onClick={() => {
                    setShowModal(false);
                  }}
                >
                  닫기
                </button>
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
};
export default UnmappedModal;
