import React, { useEffect, useState } from 'react';
import { Container, Button, Col, Row, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ShoppingCart.css';
import { Link, useNavigate } from 'react-router-dom';

export default function ShoppingCart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [totalOriginalPrice, setTotalOriginalPrice] = useState(0);
  const [totalDiscountedPrice, setTotalDiscountedPrice] = useState(0);
  const [promoCode, setPromocode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  
  useEffect(() => {
    // Load cart data from local storage
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('Cart loaded from localStorage:', savedCart);
    setCart(savedCart);
  }, []);

  useEffect(() => {
    let totalOriginal = 0;
    let totalDiscounted = 0;

    cart.forEach(course => {
      totalOriginal += course.price;
      totalDiscounted += course.price * (1 - discountPercent / 100);
    });

    setTotalOriginalPrice(totalOriginal);
    setTotalDiscountedPrice(totalDiscounted);
  }, [cart, discountPercent]);

  const handleRemoveFromCart = (courseId) => {
    const updatedCart = cart.filter(course => course.id !== courseId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleApplyPromoCode = () => {
    if (promoCode === 'EDUBRIDGE') {
      if (discountPercent === 0) {
        setDiscountPercent(50);
      } else {
        alert('Promo code has already been applied.');
      }
    } else {
      alert('Invalid promo code. Please enter a valid code.');
    }
  };

  const handleCheckOut = () => {
    navigate('/checkout', {
      state: { cart, totalOriginalPrice, totalDiscountedPrice }
    });
  };

  if (cart.length === 0) {
    return <p>Your cart is empty</p>;
  }

  return (
    <Container className="py-4">
      <h4 className="shoppingcart-header">Shopping Cart</h4>
      <Row>
        <Col md={8}>
          {cart.map((course, index) => (
            <Card key={index} className="mb-4 shadow-sm">
              <Card.Body className="card-body">
                <Row className="mb-3">
                  <Col md={4}>
                    <img src={course.thumbnail} className="img-fluid rounded" alt={course.courseName} />
                  </Col>
                  <Col md={5}>
                    <h6 className="card-subtitle mb-2" style={{ fontWeight: 'bold' }}>{course.courseName}</h6>
                    <p className="card-text">By {course.instructorName || 'unknown'}</p>
                    <Button variant="outline-secondary" className="me-2" onClick={() => handleRemoveFromCart(course.id)}>Remove</Button>
                  </Col>
                  <Col md={3} className="text-center">
                    <span className="fw-bold text-dark">${course.price}<i className="bi bi-tag-fill"></i></span>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body className="text-center">
              <h5 className="card-title fw-bold">Total:</h5>
              {discountPercent > 0 && (
                <>
                  <h2 className="card-text fw-bold">${totalDiscountedPrice.toFixed(1)}</h2>
                  <span className="text-decoration-line-through me-2">${totalOriginalPrice}</span>
                </>
              )}
              {discountPercent === 0 && (
                <h2 className="card-text fw-bold">${totalOriginalPrice}</h2>
              )}
              <Link to='/checkout'>
                <Button variant="primary" size="lg" className="w-100 mt-3" onClick={handleCheckOut}>Checkout</Button>
              </Link>
            </Card.Body>
          </Card>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="card-title">Promotions</h5>
              <input
                type="text"
                placeholder="Enter Coupon"
                value={promoCode}
                onChange={(e) => setPromocode(e.target.value)}
                className="form-control mb-3"
              />
              <Button variant="primary" onClick={handleApplyPromoCode}>Apply</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
