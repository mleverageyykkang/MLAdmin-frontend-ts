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
import TotalTracking from "pages/TotalTracking/TotalTracking";
import OtherWork from "pages/OtherWork/OtherWork";
import Settle from "pages/Settle/Settle";
import ProtectedRoute from "providers/ProtectedRoute";

const dashboardRoutes = [
  {
    path: "/user",
    name: "사용자 관리",
    icon: "GoPeople"
  },
  {
    path: "/otherwork",
    name: "업무관리",
  },
  {
    path: "/sheet",
    name: "계정 관리",
    items: [
      { path: "/accountlist", name: "계정 리스트", layout: "/sheet" },
      { path: "/deposit", name: "충전/세발/지출", layout: "/sheet" },
    ],
  },
  {
    path: "/tracking",
    name: "매출 관리",
    icon: "",
    items: [
      { path: "/media", name: "매체 트래킹", layout: "/tracking" },
      { path: "/settle", name: "광고수수료 정산서", layout: "/tracking" },
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
            <div style={{ marginTop: "95px", backgroundColor: "#f2f5fa" }}>
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
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/user" element={<User />} />
              <Route path="/otherwork" element={<OtherWork />} />
              <Route path="/sheet/accountlist" element={<AccountList />} />
              <Route path="/sheet/deposit" element={<Deposit />} />
              <Route path="/tracking/media" element={<MediaTracking />} />
              <Route path="/tracking/settle" element={<Settle />} />
              <Route path="/tracking/total" element={<TotalTracking />} />
            </Route>
          </Routes>
        </Layout>
      </AuthProvider>
    </div>
  );
}

export default App;
