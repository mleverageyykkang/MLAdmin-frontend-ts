import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import User from "./pages/User/User";
import Dashboard from "./pages/Dashboard/Dashboard";
import Sidebar from "./component/Sidebar/Sidebar";
import HeaderNavbar from "./component/Navbar/HeaderNavbar";
import AccountList from "./pages/AccountList/AccountList";
import { AuthProvider } from "./providers/authProvider";
import Deposit from "./pages/Deposit/Deposit";
import MediaTracking from "pages/MediaTracking/MediaTracking";
import Adjustment from "pages/Adjustment/Adjustment";
import TotalTracking from "pages/TotalTracking/TotalTracking";
import path from "path";
import OtherWork from "pages/OtherWork/OtherWork";

const dashboardRoutes = [
  {
    path: "/user",
    name: "사용자 관리",
  },
  {
    path: "/otherwork",
    name: "업무관리",
  },
  {
    path: "/sheet",
    name: "시트 관리",
    items: [
      // { path: "/1", name: "매체 수수료", layout: "/sheet" },
      { path: "/1", name: "계정 리스트", layout: "/sheet" },
      { path: "/2", name: "충전/세발/지출", layout: "/sheet" },
      { path: "/3", name: "광고수수료 정산서", layout: "/sheet" },
    ],
  },
  {
    path: "/tracking",
    name: "매출 트래킹",
    items: [
      { path: "/media", name: "매체별", layout: "/tracking" },
      { path: "/total", name: "종합", layout: "/tracking" },
    ],
  },
];

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <>
      {!isLoginPage ? (
        <div style={{ display: "flex" }}>
          <div style={{ width: "11%" }}>
            <Sidebar routes={dashboardRoutes} />
          </div>
          <div style={{ width: "89%" }}>
            <div style={{ position: "fixed", width: "89%", zIndex: "9999" }}>
              <HeaderNavbar routes={dashboardRoutes} />
            </div>
            <div style={{ marginTop: "85px" }} className="p-3">
              {children}
            </div>
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </>
  );
}

function App() {
  return (
    <div>
      {/* layout */}
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user" element={<User />} />
            <Route path="/otherwork" element={<OtherWork />} />
            {/* <Route path="/sheet/1" element={<Commission />} /> */}
            <Route path="/sheet/1" element={<AccountList />} />
            <Route path="/sheet/2" element={<Deposit />} />
            <Route path="/sheet/3" element={<Adjustment />} />
            <Route path="/tracking/media" element={<MediaTracking />} />
            <Route path="/tracking/total" element={<TotalTracking />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </div>
  );
}

export default App;
