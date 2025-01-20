import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.scss";
import logo from "../../assets/img/ml_logo_sm.png";
import { GoPeople,  } from "react-icons/go";


function Sidebar({ routes }: { routes: any[] }) {
  const location = useLocation();
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="sidebar-textlink">
          <div className="sidebar-logo-container">
            <img
              src={logo}
              className="sidebar-logo"
              alt="marketing leverage logo"
            />
            <div className="sidebar-text">
              <span className="sidebar-text-line">Marketing</span>
              <span className="sidebar-text-line">Leverage</span>
            </div>
          </div>
        </NavLink>
      </div>
      <nav className="sidebar-nav">
        {routes.map((route, index) => {
          if (route.items && route.items.length > 0) {
            const isActive = route.items.some(
              (item: any) => `${item?.layout}${item.path}` === location.pathname
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
              <NavLink to={`${route.path}`} className="sidebar-link">
                {route.icon && <route.icon className="sidebar-icon" />}
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
