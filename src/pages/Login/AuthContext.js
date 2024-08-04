import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user')));
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);

  const login = (userData) => {
    sessionStorage.setItem('user', JSON.stringify(userData)); // Lưu thông tin người dùng vào sessionStorage
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.removeItem('user'); // Xóa thông tin người dùng khỏi sessionStorage
    setUser(null);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
