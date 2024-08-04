import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Success.css'; // Import the CSS file
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const amount = params.get('vnp_Amount');
  const orderInfo = params.get('vnp_OrderInfo');
  const bankCode = params.get('vnp_BankCode');
  const transactionNo = params.get('vnp_TransactionNo');
  const transactionStatus = params.get('vnp_TransactionStatus');
  const responseCode = params.get('vnp_ResponseCode');
  const saveCoursesCalled = useRef(false);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    const emailAddress = storedUser?.emailAddress; // Get email from session storage
    const cart = JSON.parse(localStorage.getItem('cart'));

    console.log('Cart at success page:', cart); // Log nội dung giỏ hàng

    const getNextId = async () => {
      try {

        
        const response = await fetch("http://localhost:9999/AccessibleCourse");
        const result = await response.json();
    
        const maxId = result.reduce((max, course) => {
          const courseId = parseInt(course.id, 10);
          return courseId > max ? courseId : max;
        }, 0);
    
        return (maxId + 1).toString();
      } catch (err) {
        console.error("Error fetching data:", err);
        return null;
      }
    };
    const saveCourses = async () => {
      try {
        const nextId = await getNextId();

        if (nextId === null) {
          console.error("Failed to generate next ID");
          return;
        }
        for (const course of cart) {
          await axios.post("http://localhost:9999/AccessibleCourse", {
            id:nextId,
            emailAddress: emailAddress,
            courseid: parseInt(course.id),
            enrolledTime: new Date().toISOString()
          });
        }
        toast.success('Courses successfully saved!');
        localStorage.removeItem('cart');
        localStorage.removeItem('totalOriginalPrice');
        localStorage.removeItem('totalDiscountedPrice');

        // Save courses to session storage
        const userCourses = JSON.parse(sessionStorage.getItem('userCourses')) || {};
        if (!userCourses[emailAddress]) {
          userCourses[emailAddress] = [];
        }
        cart.forEach(course => userCourses[emailAddress].push(course.id));
        sessionStorage.setItem('userCourses', JSON.stringify(userCourses));
      } catch (error) {
        console.error('Error saving course:', error);
        toast.error('Failed to save the course.');
      }
    };

    if (transactionStatus === '00' && !saveCoursesCalled.current) {
      saveCoursesCalled.current = true;
      saveCourses();
    } else if (transactionStatus !== '00') {
      toast.error('Payment failed.');
    }
  }, [transactionStatus]);

  return (
    <div className="success-container">
      <h1 className="success-header">Transaction Status</h1>
      {transactionStatus === '00' ? (
        <div>
          <FaCheckCircle className="success-icon" />
          <h5>Your transaction was successful. Thank you for your purchase!</h5>
          <div className="success-details">
            <p>Amount: {amount}</p>
            <p>Order Info: {orderInfo}</p>
            <p>Bank Code: {bankCode}</p>
            <p>Transaction No: {transactionNo}</p>
          </div>
        </div>
      ) : (
        <div>
          <FaTimesCircle className="error-icon" />
          <h5>Your transaction failed. Please try again.</h5>
          <div className="success-details">
            <p>Response Code: {responseCode}</p>
            <p>Transaction No: {transactionNo}</p>
          </div>
        </div>
      )}
      <div className="success-button">
        <a href="/">Return to home</a>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Success;