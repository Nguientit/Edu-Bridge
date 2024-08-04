import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Nav.css';
import { AuthContext } from './Login/AuthContext';

const Nav = () => {
  const [searchKey, setSearchKey] = useState("");
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setEmail(storedUser.emailAddress);
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchKey(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?query=${searchKey}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const handleRefresh = () => {
    window.location.href = '/';
  };
  return (
    <div className="container-fluid border-bottom">
      <nav className="navbar">
        <div className="container pt-3 pb-3" style={{ maxWidth: "1840px" }}>
          <div className="d-flex align-items-center">
            <Link className="navbar-brand fw-bold fs-5" to="/" onClick={handleRefresh}>
              EduBridge
            </Link>
            <div className="d-inline-block" style={{ width: '30rem' }}>
              <form onSubmit={handleSearchSubmit}>
                <div className="position-relative">
                  <input
                    className="form-control rounded-5 pe-5 border"
                    placeholder="Keyword for searching"
                    value={searchKey}
                    onChange={handleSearchChange}
                  />
                  <div className="position-absolute end-0 top-0 pe-2" style={{ transform: 'translateY(22%)' }}>
                    <i className="bi bi-search" onClick={handleSearchSubmit}></i>
                  </div>
                </div>
              </form>
            </div>
            <select
              title="Category"
              style={{ border: "none", width: "120px", height: "35px", borderRadius: "10px", backgroundColor: "rgb(220,220,220)", marginLeft: "10px" }}
            >
              <option value="" disabled selected>Category</option>
              <option value="a">Ngôn ngữ lập trình</option>
              <option value="b">Something else</option>
            </select>
            <a className="btn ms-2 aa" href="" target="_blank">Plans and pricing</a>
          </div>
          <div className="d-flex align-items-center">
            <Link className="aa btn position-relative me-3" to="/wishlist">
              Wishlist
            </Link>
            {isLoggedIn ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-basic">
                  <i  style={{fontSize:"25px"}} className="bi bi-person-circle"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ width: "300px" }}>
                  <Dropdown.Item  style={{fontWeight:"bold"}}>{email}</Dropdown.Item>
                  <hr />
                  <Dropdown.Item as={Link} to="/addCourse">Create Course</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/managercourse">Manager Course</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/myCourse">My Course</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/profileUser">Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/changepassword">Change Password</Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Link className="btn position-relative fw-bold fs-5 me-3" to="/login">
                  Login
                </Link>
                <button className="btn btn-dark">
                  <span className='aa'>Get started</span>
                  <span><i className="bi bi-arrow-right"></i></span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
