import React, { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";
import logo from "../../assets/img/ml_logo.png";

interface RouteItem {
  path: string;
  name: string;
  icon?: string;
  layout: string;
  redirect?: boolean;
  items?: SubRouteItem[];
}

interface SubRouteItem {
  path: string;
  name: string;
  layout: string;
}

interface SidebarProps {
  color: string;
  image: string;
  routes: RouteItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ routes }) => {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({});

  const toggleItems = (key: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key], // 클릭 시 열리고 닫히도록 토글
    }));
  };

  const activeRoute = (routeName: string) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  return (
    <div className="sidebar">
      <div className="sidebar-wrapper">
        <div className="logo d-flex align-items-center justify-content-start">
          <img src={logo} alt="logo" className="w-100" />
        </div>
        <Nav>
          {routes.map((prop, key) => {
            if (!prop.redirect)
              return (
                <li
                  key={key}
                  className={prop.items ? "" : activeRoute(prop.path)}
                >
                  <NavLink
                    to={prop.layout + prop.path}
                    className="nav-link"
                    onClick={(e) => {
                      if (prop.items) {
                        e.preventDefault();
                        toggleItems(key);
                      }
                    }}
                  >
                    {prop.icon && <i className={prop.icon} />}
                    <p>{prop.name}</p>
                  </NavLink>
                  {prop.items && openItems[key] && (
                    <ul style={{ paddingLeft: "20px" }}>
                      {prop.items.map((item, subKey) => (
                        <li
                          key={subKey}
                          className={activeRoute(item.path)}
                          style={{ listStyleType: "none", padding: "5px 0" }}
                        >
                          <NavLink
                            to={item.layout + item.path}
                            className="nav-link"
                          >
                            {item.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            return null;
          })}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
