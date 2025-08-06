import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoadingPage from './components/Loading/LoadingPage';
import SelectSource from './components/ChoosePlatform/SelectSource';
import SelectDestination from './components/ChoosePlatform/SelectDestination';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingPage />} />
        <Route path="/select-source" element={<SelectSource />} />
        <Route path="/select-destination" element={<SelectDestination />} />
      </Routes>
    </Router>
  );
}

export default App;
