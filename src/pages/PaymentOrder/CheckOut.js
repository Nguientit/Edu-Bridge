import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup } from 'react-bootstrap';
import './CheckOut.css';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

export default function Checkout() {
  const location = useLocation();
  const initialCartState = () => {
    const savedCart = localStorage.getItem('cart');
    const savedTotalOriginalPrice = localStorage.getItem('totalOriginalPrice');
    const savedTotalDiscountedPrice = localStorage.getItem('totalDiscountedPrice');

    return {
      cart: savedCart ? JSON.parse(savedCart) : [],
      totalOriginalPrice: savedTotalOriginalPrice ? parseFloat(savedTotalOriginalPrice) : 0,
      totalDiscountedPrice: savedTotalDiscountedPrice ? parseFloat(savedTotalDiscountedPrice) : 0
    };
  };

  const state = location.state || initialCartState();
  const { cart, totalOriginalPrice: initialTotalOriginalPrice, totalDiscountedPrice: initialTotalDiscountedPrice } = state;

  const [Courses, setCourses] = useState([]);
  const [Instructors, setInstructors] = useState([]);
  const [Profiles, setProfiles] = useState([]);
  const [totalOriginalPrice, setTotalOriginalPrice] = useState(initialTotalOriginalPrice);
  const [totalDiscountedPrice, setTotalDiscountedPrice] = useState(initialTotalDiscountedPrice);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [originalPrices, setOriginalPrices] = useState([]);
  const [discountPrices, setDiscountPrices] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  useEffect(() => {
    console.log('Location state:', location.state);
    fetch("http://localhost:9999/Courses")
      .then(res => res.json())
      .then(result => {
        console.log('Courses fetched:', result);
        setCourses(result);
      })
      .catch(err => console.log(err));

    fetch("http://localhost:9999/Instructors")
      .then(res => res.json())
      .then(result => {
        console.log('Instructors fetched:', result);
        setInstructors(result);
      })
      .catch(err => console.log(err));

    fetch("http://localhost:9999/Profiles")
      .then(res => res.json())
      .then(result => {
        console.log('Profiles fetched:', result);
        setProfiles(result);
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      const originalPrices = cart.map(course => course.price);
      const discountPrices = originalPrices.map(price => price * (1 - discountPercent / 100));

      setOriginalPrices(originalPrices);
      setDiscountPrices(discountPrices);

      const totalOriginal = originalPrices.reduce((acc, curr) => acc + curr, 0);
      const totalDiscounted = discountPrices.reduce((acc, curr) => acc + curr, 0);

      setTotalOriginalPrice(totalOriginal);
      setTotalDiscountedPrice(totalDiscounted);

      // Save to local storage
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('totalOriginalPrice', totalOriginal);
      localStorage.setItem('totalDiscountedPrice', totalDiscounted);
    }
  }, [cart, discountPercent]);

  const totalDiscount = totalOriginalPrice - totalDiscountedPrice;

  if (Courses.length === 0 || Instructors.length === 0 || Profiles.length === 0) {
    return <div>Loading...</div>;
  }

  const handleCheckout = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (selectedPaymentMethod === 'vnpay') {
      try {
        // const exchangeRate = 25445; 
        // const amountVND = totalDiscountedPrice * exchangeRate; 
        // console.log('Amount in VND:', amountVND);
        
        const response = await axios.post('http://localhost:8888/order/create_payment_url', {
          amount: totalDiscountedPrice,
          language: 'vn',
          url_callback: "http://localhost:3000/success"
        });

        if (response.status === 200) {
          const result = response.data;
          if (result.paymentUrl) {
            window.location.href = result.paymentUrl;
          }
        } else {
          console.error('Error during checkout (response not ok):', response.statusText);
        }
      } catch (error) {
        console.error('Error during checkout (fetch failed):', error);
      }
    } else {
      console.error('Selected payment method is not VNPAY');
    }
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  
  return (
    <Container className="checkout-container">
      <h1 className="checkout-header">Checkout</h1>
      <ToastContainer position="bottom-right" />
      <Row>
        <Col md={8}>
          <div className="summary-bg">
            <h2 className="section-header">Billing address</h2>
            <Form>
              <Form.Group controlId="formCountry">
                <Form.Label style={{ fontWeight: 'bold' }}>Country</Form.Label>
                <Form.Select style={{ maxWidth: '50%' }}>
                  <option>Vietnam</option>
                  <option>...</option>
                </Form.Select>
              </Form.Group>
              <Form.Text className="form-text">
                Udemy is required by law to collect applicable transaction taxes for purchases made in certain tax jurisdictions.
              </Form.Text>
            </Form>
            <br />
            <hr />
            <h2 className="section-header">Payment method <span className="secured-connection"><i className="bi bi-lock-fill"></i>Secured connection <i className="fas fa-lock"></i></span></h2>
            <ListGroup className="payment-method">
              <ListGroup.Item action type="button" className="payment-option">
                <input type="radio" name="paypal" className="me-2" />
                <div className='payment-method-container'>
                  <img src='./images/hpp-paypal.svg' style={{ width: '42px', height: '28px' }} alt="Online Payment" />
                  <span>Pay pal</span>
                </div>
              </ListGroup.Item>

              <ListGroup.Item action type="button" className="payment-option" onClick={() => handlePaymentMethodChange('vnpay')}>
                <input type="radio" name="payment" className="me-2" checked={selectedPaymentMethod === 'vnpay'} onChange={() => handlePaymentMethodChange('vnpay')} />
                <div className='payment-method-container'>
                  <img src='./images/card-default.svg' style={{ width: '42px', height: '28px' }} alt="Online Payment" />
                  <span>Online Payment</span>
                </div>
              </ListGroup.Item>
            </ListGroup>
            {selectedPaymentMethod === 'vnpay' && (
              <blockquote className="blockquote mb-0">
                <p>In order to complete your transaction, we will transfer you over to VNPAY secure servers.</p>
                <p>Unfortunately, VNPAY does not support payments in USD therefore your payment will be in VND.</p>
              </blockquote>
            )}
            <br />
            <hr />
            <h2 className="section-header">Order details</h2>
            {cart.map((course, index) => {
              return (
                <Card key={index} className="order-card">
                  <Card.Body>
                    <Row>
                      <Col md={8}>
                        <Card.Title className="card-title">
                          <img src={course.thumbnail} alt="course" className="course-image" />
                          <span className='course-name' style={{ alignSelf: 'flex-start' }}>
                            {course.courseName}
                          </span>
                        </Card.Title>
                      </Col>
                      <Col md={4}>
                        <Card.Text className="price-text">
                          <strong>${discountPrices[index]?.toLocaleString()}</strong>
                        </Card.Text>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </Col>
        <Col md={4}>
          <div className="summary-bg">
            <h2 className="section-header">Summary</h2>
            <ListGroup className="summary">
              <Form className="summary-item">
                <div className="summary-line">
                  <span>Original Price:</span> <span>${totalOriginalPrice.toLocaleString()}</span>
                </div>
                <div className="summary-line">
                  <span>Discounts:</span> <span>${totalDiscount.toLocaleString()}</span>
                </div>
                <div className="summary-line total-line">
                  <span>Total:</span> <span>${totalDiscountedPrice.toLocaleString()}</span>
                </div>
              </Form>
            </ListGroup>
            <p className="terms">
              By completing your purchase you agree to these <a href="#terms">Terms of Service</a>.
            </p>
            <Button variant="primary" size="lg" block={true} className="checkout-button" onClick={handleCheckout}>
              Complete Checkout
            </Button>
            <p className="guarantee">30-Day Money-Back Guarantee</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
