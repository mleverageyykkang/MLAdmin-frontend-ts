// import React from "react";
// import { useLocation, NavLink } from "react-router-dom";
// import { Navbar, Container, Nav, Dropdown, Button } from "react-bootstrap";
// import routes from "../../routes";

// const Header: React.FC = () => {
//   const location = useLocation();

//   const mobileSidebarToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     document.documentElement.classList.toggle("nav-open");
//     const node = document.createElement("div");
//     node.id = "bodyClick";
//     node.onclick = function () {
//       this.parentElement?.removeChild(this);
//       document.documentElement.classList.toggle("nav-open");
//     };
//     document.body.appendChild(node);
//   };

//   const getBrandText = (): string => {
//     for (let i = 0; i < routes.length; i++) {
//       if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
//         return routes[i].name;
//       }
//     }
//     return "Brand";
//   };

//   return (
//     <Navbar bg="light" expand="lg">
//       <Container fluid>
//         <div className="d-flex justify-content-center align-items-center ml-2 ml-lg-0">
//           <Button
//             variant="dark"
//             className="d-lg-none btn-fill d-flex justify-content-center align-items-center rounded-circle p-2"
//             onClick={mobileSidebarToggle}
//           >
//             <i className="fas fa-ellipsis-v"></i>
//           </Button>
//           <Navbar.Brand
//             href="#home"
//             onClick={(e) => e.preventDefault()}
//             className="mr-2"
//           >
//             {getBrandText()}
//           </Navbar.Brand>
//         </div>
//         <Navbar.Toggle aria-controls="basic-navbar-nav" className="mr-2">
//           <span className="navbar-toggler-bar burger-lines"></span>
//           <span className="navbar-toggler-bar burger-lines"></span>
//           <span className="navbar-toggler-bar burger-lines"></span>
//         </Navbar.Toggle>
//         <Navbar.Collapse id="basic-navbar-nav">
//           <Nav className="ml-auto" navbar>
//             {/* <Nav.Item>
//               <Nav.Link
//                 className="m-0"
//                 href="#"
//                 onClick={(e) => e.preventDefault()}
//               >
//                 <span className="no-icon">Account</span>
//               </Nav.Link>
//             </Nav.Item> */}
//             {/* <Dropdown as={Nav.Item}>
//               <Dropdown.Toggle
//                 aria-expanded={false}
//                 aria-haspopup={true}
//                 as={Nav.Link}
//                 id="navbarDropdownMenuLink"
//                 variant="default"
//                 className="m-0"
//               >
//                 <span className="no-icon">Dropdown</span>
//               </Dropdown.Toggle>
//               <Dropdown.Menu aria-labelledby="navbarDropdownMenuLink">
//                 <Dropdown.Item href="#" onClick={(e) => e.preventDefault()}>
//                   Action
//                 </Dropdown.Item>
//                 <Dropdown.Item href="#" onClick={(e) => e.preventDefault()}>
//                   Another action
//                 </Dropdown.Item>
//                 <Dropdown.Item href="#" onClick={(e) => e.preventDefault()}>
//                   Something
//                 </Dropdown.Item>
//                 <Dropdown.Item href="#" onClick={(e) => e.preventDefault()}>
//                   Something else here
//                 </Dropdown.Item>
//                 <div className="divider"></div>
//                 <Dropdown.Item
//                   href="#pablo"
//                   onClick={(e) => e.preventDefault()}
//                 >
//                   Separated link
//                 </Dropdown.Item>
//               </Dropdown.Menu>
//             </Dropdown> */}
//             <Nav.Item className="d-flex align-items-center">
//               <NavLink to="/login">
//                 <span className="no-icon">Log out</span>
//               </NavLink>
//             </Nav.Item>
//           </Nav>
//         </Navbar.Collapse>
//       </Container>
//     </Navbar>
//   );
// };

// export default Header;
export default function AdminNavbar() {}
