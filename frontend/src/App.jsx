import React, { createContext, useState } from 'react';
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import JoinTest from "./pages/Student/JoinTest";
import TakeAssessment from "./pages/Student/TakeAssessment";
import TestResult from "./pages/Student/TestResult";
import CreateTest from "./pages/Admin/CreateTest";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PastTest from './pages/Admin/PastTest';
import Report from './pages/Admin/Report'
import Profile from './pages/Admin/Profile'
import UserTests from './pages/Student/UserTests';


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/join" element={<JoinTest />} />
        <Route path="/take" element={<TakeAssessment />} />
        <Route path="/result" element={<TestResult />} />
        <Route path="/admin/create" element={<CreateTest />} />
        <Route path="/admin/PastTest" element={<PastTest />} />
        <Route path="/admin/Report" element={<Report />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/usertests" element={<UserTests />} />
      </Routes>
    </>
  );
}

export default App;