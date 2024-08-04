import { Button, Col, Image, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SlideList from './SlideList';
import { useEffect, useState } from 'react';
import './Body.css';

export default function Body() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [inCart, setInCart] = useState(false);
  const [Courses, setCourses] = useState([]);
  const [Sessions, setSessions] = useState([]);
  const [Instructors, setInstructors] = useState([]);
  const [Profiles, setProfiles] = useState([]);
  const [email, setEmail] = useState({});
  const [AccessibleCourse, setAccessibleCourse] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setEmail(storedUser.emailAddress);
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:9999/Courses")
      .then(res => res.json())
      .then(result => setCourses(result))
      .catch(err => console.log(err));

    fetch("http://localhost:9999/Instructors")
      .then(res => res.json())
      .then(result => setInstructors(result))
      .catch(err => console.log(err));

    fetch("http://localhost:9999/Profiles")
      .then(res => res.json())
      .then(result => setProfiles(result))
      .catch(err => console.log(err));

    fetch(`http://localhost:9999/Sessions?course=${id}`)
      .then(res => res.json())
      .then(result => {
        const filteredSessions = result.filter(session => session.course === parseInt(id));
        setSessions(filteredSessions);
      })
      .catch(err => console.log(err));

    fetch(`http://localhost:9999/AccessibleCourse?emailAddress=${encodeURIComponent(email)}&courseid=${encodeURIComponent(id)}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(result => setAccessibleCourse(result))
      .catch(err => console.error('Error fetching data:', err));

    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, [id, email]);

  const handleAdd = async (courseId) => {
    try {
      const response = await fetch("http://localhost:9999/AccessibleCourse", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailAddress: email,
          courseid: parseInt(courseId),
          enrolledTime: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log('Enrollment successful');
        setAccessibleCourse([...AccessibleCourse, { emailAddress: email, courseid: parseInt(courseId) }]);
        navigate(`/courseEnroll?courseId=${courseId}&email=${email}`);
        window.location.reload(); // Reload the page after enrollment
      } else {
        console.error('Enrollment failed');
      }
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const handleAddToCart = (course) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.some(item => item.id === course.id)) return;
    cart.push(course);
    localStorage.setItem('cart', JSON.stringify(cart));
    setCart(cart);
    console.log('Cart updated:', cart);
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    const courseInCart = cart.some(c => c.id === Courses?.id);
    setInCart(courseInCart);
  }, [cart, Courses?.id]);

  const isCourseAccessible = (courseId) => {
    return AccessibleCourse.some(course => parseInt(course.courseid) === parseInt(courseId));
  };

  const handleButtonClick = (course) => {
    const courseAccessible = AccessibleCourse.some(accessibleCourse =>
      parseInt(accessibleCourse.courseid) === parseInt(course.id) && accessibleCourse.emailAddress === email
    );

    if (courseAccessible) {
      navigate(`/coursePage/${course.id}`);
    } else if (email !== course.instructor) {
      if (course.price > 0) {
        if (!inCart) {
          handleAddToCart(course);
          setInCart(true);
        } else {
          navigate('/wishlist');
        }
      } else {
        handleAdd(course.id);  // Gọi handleAdd khi khóa học miễn phí
      }
    }
  };

  if (Courses.length === 0 || Instructors.length === 0 || Profiles.length === 0) {
    return <p>Loading...</p>;
  }


  return (
    <div className="container-fluid border-bottom">
      <div className="container pt-3 pb-3" style={{ maxWidth: "1840px" }}>
        <div>
          <SlideList />
        </div>
        <h1>Leading courses</h1>
        <h5>Because you searched for "<Link to=''>a keyword</Link>"</h5>
        <div>
        </div>
        <Row style={{ padding: "0px 0px", marginBottom: "50px", marginTop: "50px" }}>
          {Courses.map((course, index) => {
            if(course.visibility!==0){

           
            const instructor = Instructors.find(instr => instr.id == course.instrucotor)?.emailAddress;
            const profile = Profiles.find(p => p.emailAddress == instructor)?.fullName;
            const handleRefresh = () => {
              window.location.href = '/news/'+course.id;
            };
            let priceDisplay;
            if (course.price > 0) {
              priceDisplay = <p><i className="bi bi-currency-dollar"></i>{course.price}</p>;
            } else {
              priceDisplay = <p>Free</p>;
            }

            const isCourseInstructor = email === instructor;
            const hoverBoxClass = (index + 1) % 4 === 0 ? 'hover-box hover-box-left' : 'hover-box';
            return (
              <Col key={index} lg={3} md={6} sm={6} xs={12} style={{ padding: "0px 10px", marginBottom: "20px" }}> 
                <div className='course-container'>
                  <Row className="g-0" style={{borderRadius:'10px' , border: '1px solid rgb(169,169,169)', height: "400px", boxShadow: "10px 10px 15px rgba(0, 0, 0, 0.3)" }}>
                    <Col style={{  maxWidth: "100%", position: "relative" }}>
                      <div className={hoverBoxClass}>
                        <h4>{course.courseName}</h4>
                        <h6>{course.tagLine}</h6>
                        <h6 style={{ opacity: "0.5" }}>By {profile}</h6>
                        {priceDisplay}
                        {isCourseAccessible(course.id) && (
                        
                          <Button onClick={() => handleButtonClick(course)} disabled={isCourseInstructor}>
                            Go to course
                          </Button>
                        )}
                        {!isCourseAccessible(course.id) && course.price > 0 && (
                          <Button onClick={() => handleButtonClick(course)} disabled={isCourseInstructor}>
                            {inCart ? 'Go to Wishlist' : 'Add to Wishlist'}
                          </Button>
                        )}
                        {!isCourseAccessible(course.id) && course.price === 0 && (
                          <Button onClick={() => handleButtonClick(course)} disabled={isCourseInstructor}>
                            Enroll now
                          </Button>
                        )}
                      </div>
                      <Link to={`/news/${course.id}`}onClick={handleRefresh} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Image
                        
                          src={`${course.thumbnail}`}
                          style={{ width: '100%', height: '200px', objectFit: 'cover' ,borderRadius:'10px'}}
                        />
                        <h4 style={{ margin: '0', color: 'inherit' }}>{course.courseName}</h4>
                        <h6>{course.tagLine}</h6>
                      </Link>
                      <h5 style={{ opacity: "0.5" }}>{profile}</h5>
                      <Row style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        <Col>
                          <h5 style={{ color: "orangered" }}>
                            {priceDisplay}
                          </h5>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              </Col>
            );
          }
          })}
        
        </Row>
      </div>
    </div>
  );
}