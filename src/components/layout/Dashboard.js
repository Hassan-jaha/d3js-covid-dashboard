import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  background-color: #ffffff;
  padding: 20px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Dashboard = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <DashboardContainer>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <MainContent>
        <Header>
          <Title>D3.js Dashboard</Title>
          <MenuButton onClick={toggleSidebar}>☰</MenuButton>
        </Header>
        {children}
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
