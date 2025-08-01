import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Static login function for UI demo
  const login = async (email, password) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    if (email && password) {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: email,
        role: 'user'
      };
      
      setUser(mockUser);
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      setLoading(false);
      return { success: true };
    }
    
    setLoading(false);
    return { 
      success: false, 
      error: 'Please enter valid credentials' 
    };
  };

  // Static register function for UI demo
  const register = async (userData) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    return { 
      success: true, 
      message: 'Registration successful! Please login to continue.' 
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  // Check for existing mock user on mount
  React.useEffect(() => {
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      setUser(JSON.parse(mockUser));
    } else {
      // For development: auto-login with mock user
      const devUser = {
        id: 1,
        name: 'John Doe',
        email: 'gaganshuklarmg@gmail.com',
        role: 'user'
      };
      setUser(devUser);
      localStorage.setItem('mockUser', JSON.stringify(devUser));
    }
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};