import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { AuthContext } from './AuthContext';

const ProfileUser = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    emailAddress: '',
    phoneNumber: '',
    fullName: '',
    gender: '',
    dateOfBirth: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetch(`http://localhost:9999/Profiles/${user.id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch user data');
          }
          return res.json();
        })
        .then(data => {
          setFormData(data);
        })
        .catch(err => {
          console.log(err);
          setError('An error occurred while fetching user data');
        });
    } else {
      setError('User not found. Please log in.');
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user && user.id) {
      fetch(`http://localhost:9999/Profiles/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to update profile data');
          }
          return res.json();
        })
        .then(data => {
          setSuccess('Profile updated successfully!');
          setError('');
          setTimeout(() => {
            setSuccess('');
            setIsEditing(false);
          }, 2000);
        })
        .catch(err => {
          console.log(err);
          setError('An error occurred while updating profile');
          setSuccess('');
        });
    } else {
      setError('User not found. Please log in.');
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center profile-container">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow-lg p-4 border-0">
            <Card.Body>
              <h2 className="text-center mb-4">Your Profile</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              {isEditing ? (
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
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      name="emailAddress"
                      value={formData.emailAddress}
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
                  <Button variant="primary" type="submit" className="w-100">
                    Save Changes
                  </Button>
                </Form>
              ) : (
                <div>
                  <p><strong>Full Name:</strong> {formData.fullName}</p>
                  <p><strong>Email Address:</strong> {formData.emailAddress}</p>
                  <p><strong>Phone Number:</strong> {formData.phoneNumber}</p>
                  <p><strong>Gender:</strong> {formData.gender}</p>
                  <p><strong>Date of Birth:</strong> {formData.dateOfBirth}</p>
                  <Button variant="primary" className="w-100 mt-3" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileUser;
