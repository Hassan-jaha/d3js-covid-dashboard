import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: #2c3e50;
  color: white;
  height: 100%;
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    position: fixed;
    transform: ${({ $isOpen }) =>
      $isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    z-index: 999;
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.h2`
  margin: 0;
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0 0 0;
`;

const NavItem = styled.li`
  padding: 10px 20px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  display: block;
`;

const Overlay = styled.div`
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const charts = [
  { path: '/', name: 'Dashboard Home' },
  { path: '/bar-chart', name: 'Bar Chart' },
  { path: '/line-chart', name: 'Line Chart' },
  { path: '/pie-chart', name: 'Pie Chart' },
  { path: '/scatter-plot', name: 'Scatter Plot' },
  { path: '/area-chart', name: 'Area Chart' },
  { path: '/bubble-chart', name: 'Bubble Chart' },
  { path: '/heatmap', name: 'Heat Map' },
  { path: '/treemap', name: 'Tree Map' },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <Logo>D3.js Charts</Logo>
        </SidebarHeader>

        <NavMenu>
          {charts.map(chart => (
            <NavItem key={chart.path}>
              <NavLink to={chart.path} onClick={toggleSidebar}>
                {chart.name}
              </NavLink>
            </NavItem>
          ))}
        </NavMenu>
      </SidebarContainer>

      <Overlay $isOpen={isOpen} onClick={toggleSidebar} />
    </>
  );
};

export default Sidebar;
