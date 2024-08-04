import React, { useState, useContext } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`http://localhost:9999/Users?emailAddress=${email}&password=${password}`)
      .then(res => res.json())
      .then(result => {
        const user = result.find(u => u.emailAddress === email && u.password === password);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          login(user); 
          navigate('/');
          window.location.reload();
        } else {
          const existingUser = result.find(u => u.emailAddress === email);
          if (existingUser) {
            setError('Email or password is incorrect.');
          } else {
            setError('Email and account not registered.');
            setTimeout(() => {
              navigate('/register');
            }, 3000); // Redirect to register page after 3 seconds
          }
        }
      })
      .catch(err => {
        console.log(err);
        setError('An error occurred while trying to log in.');
      });
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center login-container" style={{marginTop:"50px",marginBottom:"50px"}}>
      <Row className="w-100 justify-content-center">
        <Col md="8" lg="6" xl="4">
          <Card className="shadow-lg p-4 border-0" style={{ backgroundColor: '#f8f9fa' }}>
            <Card.Body>
              <h2 className="text-center mb-4">Login</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mb-3">
                  Login
                </Button>
              </Form>
              {error && <Alert variant="danger">{error}</Alert>}
              <div className="text-center mt-3">
                <Link to="/forgotPassword" className="d-block">Forgot Password?</Link>
                <Link to="/changePassword" className="d-block mt-2">Change Password</Link>
                <Link to="/register" className="d-block mt-2">Register New Account</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
