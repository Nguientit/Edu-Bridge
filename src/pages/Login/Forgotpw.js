import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import './Forgotpw.css'; 
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (email === '') {
      setError('Vui lòng nhập địa chỉ email của bạn');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/forgot-password', { // Cập nhật URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess('Mã xác nhận đã được gửi tới email của bạn.');
      } else {
        const data = await response.json();
        setError(data.message || 'Gửi mã xác nhận thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100 justify-content-center">
        <Col md="6" lg="4">
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Quên Mật Khẩu</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="Nhập email của bạn" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-3">
                  Đặt Lại Mật Khẩu
                </Button>
              </Form>
              <div className="text-center mt-3">
                <Link to="/login">Trở về đăng nhập</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
