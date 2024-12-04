import React from "react";
// import Dashboard from "views/Dashboard";
// import UserProfile from "views/User";
// import Notifications from "views/Notifications";
// import AccountList from "views/AccountList";

interface RouteItem {
  path: string;
  name: string;
  icon: string;
  //   component: React.ComponentType;
  layout: string;
  items?: Array<SubRouteItem>;
}

interface SubRouteItem {
  path: string;
  name: string;
  layout: string;
}

const AppRoutes: RouteItem[] = [
  {
    path: "/dashboard",
    name: "메인",
    icon: "nc-icon nc-chart-pie-35",
    // component: Dashboard,
    layout: "/admin",
  },
  {
    path: "/user",
    name: "사용자 관리",
    icon: "nc-icon nc-circle-09",
    // component: UserProfile,
    layout: "/admin",
  },
  {
    path: "/sheet",
    name: "시트 관리",
    icon: "nc-icon nc-notes",
    // component: AccountList,
    layout: "/admin",
    items: [
      {
        path: "/1",
        name: "매체 수수료",
        layout: "/admin/sheet",
      },
      {
        path: "/2",
        name: "계정 리스트",
        layout: "/admin/sheet",
      },
      {
        path: "/3",
        name: "충전/세발/지출",
        layout: "/admin/sheet",
      },
      {
        path: "/4",
        name: "광고수수료 정산서",
        layout: "/admin/sheet",
      },
    ],
  },
  {
    path: "/tracking",
    name: "매출 트래킹",
    icon: "nc-icon nc-chart-bar-32",
    // component: Notifications,
    layout: "/admin",
  },
];

export default AppRoutes;
