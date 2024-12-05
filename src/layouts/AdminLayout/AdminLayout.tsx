import React from "react";
import Sidebar from "../../component/Sidebar/Sidebar";
const routes: Array<string> = [];
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar routes={routes} />
      <div className="main-content">
        <div className="content-wrapper">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
