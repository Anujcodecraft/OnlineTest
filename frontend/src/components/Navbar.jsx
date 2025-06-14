import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  LogOut, 
  PlusCircle, 
  FileText, 
  UserPlus, 
  LogIn,
  Menu,
  X,
  GraduationCap,
  Shield,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";

// Styled Components
const NavContainer = styled(motion.nav)`
  position: relative;
  padding: 0;
  background: transparent;
  z-index: 1000;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      linear-gradient(135deg, rgba(12, 12, 23, 0.95) 0%, rgba(25, 25, 45, 0.95) 100%);
    backdrop-filter: blur(20px) saturate(1.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0 0 24px 24px;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
`;

const NavContent = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover::after {
    width: 100%;
  }
  
  .logo-icon {
    padding: 8px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
  }
  
  &:hover .logo-icon {
    transform: rotate(10deg) scale(1.1);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
  }
`;

const NavLinks = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: calc(100% + 1rem);
    left: 1rem;
    right: 1rem;
    background: rgba(12, 12, 23, 0.98);
    backdrop-filter: blur(20px);
    flex-direction: column;
    padding: 1.5rem;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  font-weight: 500;
  font-size: 0.9rem;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  
  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
    
    .nav-icon {
      transform: scale(1.2);
    }
  }
  
  .nav-icon {
    transition: transform 0.2s ease;
  }
`;

const UserSection = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`;

const UserBadge = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #fff;
  font-size: 0.85rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const RoleChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: ${props => props.role === 'admin' ? 
    'linear-gradient(135deg, #ff6b6b, #ee5a52)' : 
    'linear-gradient(135deg, #4ecdc4, #44b09e)'};
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px ${props => props.role === 'admin' ? 
    'rgba(255, 107, 107, 0.3)' : 'rgba(78, 205, 196, 0.3)'};
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.variant === 'danger' ? 
    'linear-gradient(135deg, #ff6b6b, #ee5a52)' : 
    'linear-gradient(135deg, #667eea, #764ba2)'};
  color: #fff;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px ${props => props.variant === 'danger' ? 
    'rgba(255, 107, 107, 0.3)' : 'rgba(102, 126, 234, 0.3)'};
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transition: all 0.4s ease;
    transform: translate(-50%, -50%);
  }
  
  &:hover::before {
    width: 300px;
    height: 300px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props => props.variant === 'danger' ? 
      'rgba(255, 107, 107, 0.4)' : 'rgba(102, 126, 234, 0.4)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  span, svg {
    position: relative;
    z-index: 1;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const FloatingOrb = styled(motion.div)`
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <NavContainer
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      style={{ 
        position: 'sticky', 
        top: 0,
        transform: scrolled ? 'translateY(0)' : 'translateY(0)'
      }}
    >
      <FloatingOrb
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ top: '-100px', left: '10%' }}
      />
      
      <FloatingOrb
        animate={{
          x: [0, -80, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ top: '-100px', right: '15%' }}
      />
      
      <NavContent>
        <Logo to="/">
          <div className="logo-icon">
            <GraduationCap size={24} />
          </div>
          <span>TestPortal</span>
        </Logo>
        
        <MobileMenuButton onClick={toggleMobileMenu}>
          <motion.div
            animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.div>
        </MobileMenuButton>
        
        <NavLinks 
          isOpen={isMobileMenuOpen}
          initial={false}
          animate={isMobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        >
          <AnimatePresence mode="wait">
            {user ? (
              <UserSection>
                <UserBadge
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <User size={16} />
                  <span>{user.name || user.email || 'User'}</span>
                  <RoleChip role={user.role}>
                    {user.role === 'admin' ? <Shield size={10} /> : <Zap size={10} />}
                    {user.role}
                  </RoleChip>
                </UserBadge>
                
                <motion.div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {user.role === "student" && (
                    <>
                      <NavLink to="/join">
                        <FileText size={16} className="nav-icon" />
                        <span>Join Test</span>
                      </NavLink>
                      
                      <NavLink to="/usertests">
                        <FileText size={16} className="nav-icon" />
                        <span>Past Tests</span>
                      </NavLink>
                    </>
                  )}
                  
                  {user.role === "admin" && (
                    <>
                      <NavLink to="/admin/create">
                        <PlusCircle size={16} className="nav-icon" />
                        <span>Create Test</span>
                      </NavLink>
                      
                      <NavLink to="/admin/PastTest">
                        <FileText size={16} className="nav-icon" />
                        <span>Past Tests</span>
                      </NavLink>
                    </>
                  )}
                  
                  <ActionButton
                    onClick={logout}
                    variant="danger"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </ActionButton>
                </motion.div>
              </UserSection>
            ) : (
              <motion.div 
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <NavLink to="/">
                  <LogIn size={16} className="nav-icon" />
                  <span>Login</span>
                </NavLink>
                
                <ActionButton
                  as={Link}
                  to="/register"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserPlus size={16} />
                  <span>Register</span>
                </ActionButton>
              </motion.div>
            )}
          </AnimatePresence>
        </NavLinks>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar;