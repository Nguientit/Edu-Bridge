import React, { useContext, useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './ChangePassword.css'; // Import custom CSS if needed
import { AuthContext } from './AuthContext';

const ChangePassword = () => {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      // Fetch user data
      const response = await fetch(`http://localhost:9999/Users?emailAddress=${email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const users = await response.json();
      const user = users.find(u => u.emailAddress === email && u.password === currentPassword);

      if (!user) {
        setError('Email or password is incorrect.');
        return;
      }

      // Update user's password
      const updatedUser = { ...user, password: newPassword };

      const updateResponse = await fetch(`http://localhost:9999/Users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (updateResponse.ok) {
        // Clear user session or authentication data if any
        // localStorage.removeItem('user'); // Example: if using localStorage
        // sessionStorage.removeItem('user'); // Example: if using sessionStorage

        setSuccess('Password changed successfully! Redirecting to Login.');
        setTimeout(() => {

            logout();
            navigate('/login');
          
          
        }, 2000);
      } else {
        setError('Failed to change password. Please try again.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('An error occurred while trying to change password.');
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center change-password-container">
      <Row className="w-100 justify-content-center">
        <Col md="8" lg="6" xl="4">
          <Card className="shadow-lg p-4 border-0">
            <Card.Body>
              <h2 className="text-center mb-4">Change Password</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formCurrentPassword" className="mb-3">
                  <Form.Label>Old Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter old Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formNewPassword" className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formConfirmPassword" className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm new Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Change Password
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ChangePassword;
