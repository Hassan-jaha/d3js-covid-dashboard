import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/layout/Dashboard';
import Home from './pages/Home';
import BarChartPage from './pages/BarChartPage';
import LineChartPage from './pages/LineChartPage';
import PieChartPage from './pages/PieChartPage';
import ScatterPlotPage from './pages/ScatterPlotPage';
import AreaChartPage from './pages/AreaChartPage';
import HeatMapPage from './pages/HeatMapPage';
import TreeMapPage from './pages/TreeMapPage';
import BubbleChartPage from './pages/BubbleChartPage';

function App() {
  return (
    <Router>
      <Dashboard>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bar-chart" element={<BarChartPage />} />
          <Route path="/line-chart" element={<LineChartPage />} />
          <Route path="/pie-chart" element={<PieChartPage />} />
          <Route path="/scatter-plot" element={<ScatterPlotPage />} />
          <Route path="/area-chart" element={<AreaChartPage />} />
          <Route path="/heatmap" element={<HeatMapPage />} />
          <Route path="/treemap" element={<TreeMapPage />} />
          <Route path="/bubble-chart" element={<BubbleChartPage />} />
        </Routes>
      </Dashboard>
    </Router>
  );
}

export default App;
