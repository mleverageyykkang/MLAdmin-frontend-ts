import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/img/ml_logo.png";

function Sidebar({ routes }: { routes: any[] }) {
  const location = useLocation();
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/dashboard">
          <img
            src={logo}
            className="sidebar-logo"
            alt="marketing leverage logo"
          />
        </NavLink>
      </div>
      <nav className="sidebar-nav">
        {routes.map((route, index) => {
          if (route.items && route.items.length > 0) {
            const isActive = route.items.some(
              (item: any) => `${item.layout}${item.path}` === location.pathname
            );

            return (
              <div key={index} className="sidebar-group">
                <NavLink
                  to={route.items[0].layout + route.items[0].path} // 부모 링크의 경로 설정
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                >
                  {route.name}
                </NavLink>
                <ul>
                  {route.items.map((item: any, subIndex: number) => (
                    <li key={subIndex} className="sidebar-item">
                      <NavLink
                        to={`${item.layout}${item.path}`}
                        className="sidebar-link"
                      >
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          return (
            <div key={index} className="sidebar-item">
              <NavLink
                to={`${route.layout}${route.path}`}
                className="sidebar-link"
              >
                {route.name}
              </NavLink>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
