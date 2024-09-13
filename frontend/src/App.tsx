import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Register from './components/Register';
import NewsList from './components/NewsList';
import Login from './components/Login';
import Header from './components/Header';

export const UserContext = createContext<{
  user: string | undefined;
  setUser: React.Dispatch<React.SetStateAction<string | undefined>>;
}>({ user: undefined, setUser: () => {} });

function App() {
  const [user, setUser] = useState<string | undefined>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser || undefined;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', user);
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
