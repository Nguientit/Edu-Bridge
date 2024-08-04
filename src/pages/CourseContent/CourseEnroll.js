import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';

const CourseEnroll = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const courseId = searchParams.get('courseId');
  const email = searchParams.get('email');
  const [course, setCourse] = useState({});
  const [Instructors, setInstructors] = useState([]);
  const [Profiles, setProfiles] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:9999/Courses/${courseId}`)
      .then(res => res.json())
      .then(result => {
        setCourse(result);
      })
      .catch(err => console.log(err));
    fetch("http://localhost:9999/Instructors")
      .then(res => res.json())
      .then(result => setInstructors(result))
      .catch(err => console.log(err));

    fetch("http://localhost:9999/Profiles")
      .then(res => res.json())
      .then(result => setProfiles(result))
      .catch(err => console.log(err));
  }, [courseId]);

  if (!course) {
    return <p>Loading...</p>;
  }
  let priceDisplay;
  if (course.price > 0) {
    priceDisplay = <p><i className="bi bi-currency-dollar"></i> {course.price}</p>;
  } else {
    priceDisplay = <p>Free</p>;
  }

  const a = Instructors.find(c => c.id == course.instrucotor)?.emailAddress;
  const profile = Profiles.find(p => p.emailAddress == a)?.fullName;



  return (
    <Container fluid className="app-container">
      <Row className="justify-content-center">
        <Col md={8} className="course-detail-container">
          <Card className="shadow-lg p-4 border-0">
            <Row>
              <Col md={4}>
                <Card.Img variant="top" src={course.thumbnail} className="card-img" />
              </Col>
              <Col md={8}>
                <Card.Body>
                  <Card.Title>{course.courseName}</Card.Title>
                  <Card.Text>{course.tagLine}</Card.Text>
                  <Card.Text>
                    {
                      profile
                    }</Card.Text>
                  <Card.Text className="card-text">{priceDisplay}</Card.Text>
                  <Link to={`/coursePage/${course.id}`}>
                    <Button variant="secondary" style={{ width: "200px" }} className="card-btn">
                      Start Course
                    </Button>
                  </Link>

                  <h5>Your Progress</h5>
                  {/* Uncomment and use a real progress value */}
                  <ProgressBar now={0} label={`${0}%`} />
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseEnroll;