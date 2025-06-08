import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: '1rem', background: '#222', color: '#fff' }}>
      {user ? (
        <>
          {user.role === "student" && (
            <Link to="/join" style={{ color: '#fff', marginRight: '1rem' }}>Join Test</Link>
          )}
          {user.role === "admin" && (
            <Link to="/admin/create" style={{ color: '#fff', marginRight: '1rem' }}>Create Test</Link>
          )}
          <button onClick={logout} style={{ background: 'red', color: '#fff' }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/" style={{ color: '#fff', marginRight: '1rem' }}>Login</Link>
          <Link to="/register" style={{ color: '#fff' }}>Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
