import  { useContext, useState, useEffect } from 'react';
import { IoMenu, IoClose } from 'react-icons/io5';
import { UserContext } from '../App';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollActive, setScrollActive] = useState(false);
  const { user, setUser } = useContext(UserContext);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  console.log("User:", user);

  const handlelogout = () => {
    setUser(undefined); 
    window.location.href = "/";
    localStorage.removeItem('user'); 
    localStorage.removeItem('token'); 
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setScrollActive(true);
      } else {
        setScrollActive(false);
      }
      setMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main>
      <header className={scrollActive ? 'scrolled' : ''}>
        <a href="/" className="logo">
          <img src="data:image/png;base64,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" alt="Logo" className="logo-icon" />
        </a>

        <div id="menu" onClick={toggleMenu}>
          {menuOpen ? <IoClose className="menu-icon" /> : <IoMenu className="menu-icon" />}
        </div>

        <nav className={`navbar ${menuOpen ? 'nav-toggle' : ''}`}>
          <ul>
            <li><a className="active" href="/">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#education">Education</a></li>
            <li><a href="#work">Work</a></li>
            <li><a href="#experience">Experience</a></li>
            {user ? (
              <li><span onClick={handlelogout} style={{fontSize: "25px" , cursor: "pointer" }}>Logout</span></li>
            ) : (
              <li><a href="/register">Sign Up</a></li>
            )}
          </ul>
        </nav>
      </header>
    </main>
  );
};

export default Header;
