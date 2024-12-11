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
import Commission from "./pages/Commission/Commission";
import { AuthProvider } from "./providers/authProvider";
import Deposit from "./pages/Deposit/Deposit";

const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "메인",
    icon: "nc-icon nc-chart-pie-35",
    layout: "",
  },
  {
    path: "/user",
    name: "사용자 관리",
    icon: "nc-icon nc-circle-09",
    layout: "",
  },
  {
    path: "/sheet",
    name: "시트 관리",
    icon: "nc-icon nc-notes",
    items: [
      { path: "/1", name: "매체 수수료", layout: "/sheet" },
      { path: "/2", name: "계정 리스트", layout: "/sheet" },
      { path: "/3", name: "충전/세발/지출", layout: "/sheet" },
      { path: "/4", name: "광고수수료 정산서", layout: "/sheet" },
    ],
  },
  {
    path: "/tracking",
    name: "매출 트래킹",
    icon: "nc-icon nc-chart-bar-32",
    layout: "",
  },
];

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <>
      {!isLoginPage ? (
        <div style={{ display: "flex" }}>
          <div style={{ width: "13%" }}>
            <Sidebar routes={dashboardRoutes} />
          </div>
          <div style={{ width: "87%" }}>
            <HeaderNavbar routes={dashboardRoutes} />
            <div className="p-3">{children}</div>
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
            <Route path="/sheet/1" element={<Commission />} />
            <Route path="/sheet/2" element={<AccountList />} />
            <Route path="/sheet/3" element={<Deposit />} />
            <Route path="/sheet/4" element={<User />} />
            <Route path="/tracking" element={<User />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </div>
  );
}

export default App;
