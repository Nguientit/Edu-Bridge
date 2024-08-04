// src/EnterCode.js
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import './EnterCode.css'; // Import custom CSS if needed

const EnterCode = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Simulate verifying the code
    // In a real application, replace with actual API call
    if (code === '') {
      setError('Please enter the recovery code');
      return;
    }

    try {
      // Replace with your API endpoint
      const response = await fetch('https://your-api-endpoint.com/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        setSuccess('Code verified successfully!');
      } else {
        setError('Invalid recovery code. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100 justify-content-center">
        <Col md="6" lg="4">
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Enter Recovery Code</h2>
              <p className="text-center mb-4">A recovery code has been sent to your email.</p>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicCode">
                  <Form.Label>Code</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter code" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-3">
                  Reset Password
                </Button>
              </Form>
              <div className="text-center mt-3">
                <a href="#!">Resend Code</a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EnterCode;
