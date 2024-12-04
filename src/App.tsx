import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./component/Login";
import User from "./pages/User/User";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/users" element={<User />} />
      </Routes>
    </div>
  );
}

export default App;
