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


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/join" element={<ProtectedRoute role="student"><JoinTest /></ProtectedRoute>} />
        <Route path="/take" element={<ProtectedRoute role="student"><TakeAssessment /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute role="student"><TestResult /></ProtectedRoute>} />
        <Route path="/admin/create" element={<ProtectedRoute role="admin"><CreateTest /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;