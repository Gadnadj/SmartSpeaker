import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Controller from './components/Controller';
import Deaf from './components/Deaf';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Controller />} />
        <Route path='/sourdsmalentendants' element={<Deaf />} />
      </Routes>
    </Router>
  );
};

export default App;
