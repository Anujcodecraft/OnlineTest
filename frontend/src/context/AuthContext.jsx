import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const id = localStorage.getItem("userid");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    if (token && role && id) {
      setUser({ token, role, id, name, email });
    }
  }, []);

  const login = (token, role,use) => {
    const id = use._id;
    const name = use.name;
    const email = use.email;
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("userid", id);
    localStorage.setItem("name", name);
    localStorage.setItem("email", email); 
    
    setUser({ token, role,id, name, email });

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
