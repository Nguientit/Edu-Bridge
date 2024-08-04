import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    fullName: '',
    gender: '',
    dateOfBirth: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setSuccess('');
    } else if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setSuccess('');
    } else if (formData.phoneNumber.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      setSuccess('');
    } else {
      // Check if email already exists
      fetch(`http://localhost:9999/Users?emailAddress=${formData.email}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to check email availability');
          }
          return res.json();
        })
        .then(data => {
          // If email exists, show error
          if (data.length > 0) {
            setError('Email address already exists. Please use a different email.');
            setSuccess('');
          } else {
            // Generate a unique ID for the new user
            const newUserId = new Date().getTime().toString();
            const newProfile = {
              id: newUserId,
              emailAddress: formData.email,
              profilePicture: "https://via.placeholder.com/150", 
              fullName: formData.fullName,
              headline: "New user",
              gender: formData.gender === "male" ? "male" : formData.gender === "female" ? "female" : "other",
              registeredTime: new Date().toISOString(),
              phoneNumber: formData.phoneNumber,
              dateOfBirth: formData.dateOfBirth
            };

            // Register new user
            fetch('http://localhost:9999/Users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                id: newUserId,
                emailAddress: formData.email,
                password: formData.password,
                role: [
                  {
                    id: 1,
                    name: "user"
                  }
                ]
            })
          })
            .then(res => {
              if (!res.ok) {
                throw new Error('Failed to register');
              }
              return res.json();
            })
            .then(() => {
              // Add profile data
              fetch('http://localhost:9999/Profiles', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(newProfile)
              })
              .then(res => {
                if (!res.ok) {
                  throw new Error('Failed to create profile');
                }
                return res.json();
              })
              .then(() => {
                setFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  phoneNumber: '',
                  fullName: '',
                  gender: '',
                  dateOfBirth: ''
                });
                setError('');
                setSuccess('Registration successful!');
                setTimeout(() => {
                  navigate('/login');
                }, 2000);
              })
              .catch(err => {
                console.log(err);
                setError('An error occurred during profile creation');
                setSuccess('');
              });
            })
            .catch(err => {
              console.log(err);
              setError('An error occurred during registration');
              setSuccess('');
            });
          }
        })
        .catch(err => {
          console.log(err);
          setError('Failed to check email availability');
          setSuccess('');
        });
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center register-container">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow-lg p-4 border-0">
            <Card.Body>
              <h2 className="text-center mb-4">Register New Account</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicFullName" className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formBasicEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formBasicPhoneNumber" className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter phone number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formBasicPassword" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formBasicConfirmPassword" className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formBasicGender" className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Control
                    as="select"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formBasicDateOfBirth" className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-3">
                  Register
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
