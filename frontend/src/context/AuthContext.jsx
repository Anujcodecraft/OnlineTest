import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const id = localStorage.getItem("userid");;
    if (token && role && id) {
      setUser({ token, role, id });
    }
  }, []);

  const login = (token, role,use) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    const id = use._id;
    localStorage.setItem("userid", id);
    
    setUser({ token, role,id });
    if (role === "admin") navigate("/admin/create");
    else navigate("/join");
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
