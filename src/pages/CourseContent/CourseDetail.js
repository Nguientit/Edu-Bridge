import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './CourseDetail.css';

export default function CourseDetail() {
  const { id } = useParams();
  const [Courses, setCourses] = useState(null);
  const [Instructors, setInstructors] = useState([]);
  const [Profiles, setProfiles] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [Sessions, setSessions] = useState([]);
  const [AccessibleCourse, setAccessibleCourse] = useState([]);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [inCart, setInCart] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseRatings, setCourseRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [starPercentages, setStarPercentages] = useState([]);
  const [ratingForm, setRatingForm] = useState({
    starRate: 0,
    comment: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [courseCertificate, setCourseCertificate] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setEmail(storedUser.emailAddress);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseResponse = await fetch(`http://localhost:9999/Courses/${id}`);
        const courseData = await courseResponse.json();
        setCourses(courseData);

        const instructorResponse = await fetch("http://localhost:9999/Instructors");
        const instructorData = await instructorResponse.json();
        setInstructors(instructorData);

        const profileResponse = await fetch("http://localhost:9999/Profiles");
        const profileData = await profileResponse.json();
        setProfiles(profileData);

        const sessionResponse = await fetch(`http://localhost:9999/Sessions?course=${id}`);
        const sessionData = await sessionResponse.json();
        const filteredSessions = sessionData.filter(session => session.course === parseInt(id));
        setSessions(filteredSessions);

        if (email) {
          const accessibleCourseResponse = await fetch(`http://localhost:9999/AccessibleCourse?emailAddress=${encodeURIComponent(email)}&courseid=${encodeURIComponent(id)}`);
          const accessibleCourseData = await accessibleCourseResponse.json();
          const enrolledCourse = accessibleCourseData.find(course => course.emailAddress === email && course.courseid === parseInt(id));
          if (enrolledCourse) {
            setAccessibleCourse([enrolledCourse]);
            setIsEnrolled(true);
          } else {
            setAccessibleCourse([]);
            setIsEnrolled(false);
          }
        }

        const ratingResponse = await fetch(`http://localhost:9999/CourseRating?course=${id}`);
        const ratingData = await ratingResponse.json();
        setCourseRatings(ratingData);
        calculateStatistics(ratingData);

        const certificateResponse = await fetch(`http://localhost:9999/Certificates`);
        const certificateData = await certificateResponse.json();
        const courseCert = certificateData.find(cert => cert.emailAddress === email && cert.course === parseInt(id));
        setCourseCertificate(courseCert);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000); // polling every 5 seconds

    return () => clearInterval(intervalId);
  }, [id, email]);

  const calculateStatistics = (ratings) => {
    const totalRatings = ratings.length;
    if (totalRatings === 0) {
      setAverageRating(0);
      setStarPercentages([0, 0, 0, 0, 0]);
      return;
    }
    const totalStars = ratings.reduce((acc, rating) => acc + rating.starRate, 0);
    const average = totalStars / totalRatings;

    const starCounts = [0, 0, 0, 0, 0];
    ratings.forEach(rating => {
      starCounts[rating.starRate - 1]++;
    });

    const percentages = starCounts.map(count => (count / totalRatings) * 100);

    setAverageRating(average);
    setStarPercentages(percentages);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`bi ${i < rating ? 'bi-star-fill' : 'bi-star'}`}
        onClick={() => handleStarClick(i + 1)}
        style={{ cursor: 'pointer' }}
      ></i>
    ));
  };

  const handleStarClick = (star) => {
    setRatingForm({ ...ratingForm, starRate: star });
  };

  const handleCommentChange = (e) => {
    setRatingForm({ ...ratingForm, comment: e.target.value });
  };

  const handleSubmit = () => {
    if (ratingForm.starRate === 0) {
      alert('Please select a rating.');
      return;
    }
    const newRating = {
      course: parseInt(id),
      emailAddress: email,
      starRate: ratingForm.starRate,
      comment: ratingForm.comment,
      ratedTime: new Date().toISOString()
    };
    saveRatingToDatabase(newRating);
    setShowModal(false);
    setRatingForm({
      starRate: 0,
      comment: ""
    });
  };

  const saveRatingToDatabase = async (newRating) => {
    try {
      const response = await fetch("http://localhost:9999/CourseRating", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRating),
      });

      if (response.ok) {
        setCourseRatings([...courseRatings, newRating]);
        calculateStatistics([...courseRatings, newRating]);
      } else {
        console.error('Error saving rating');
      }
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const getProfileByEmail = (email) => {
    return Profiles?.find(profile => profile.emailAddress === email);
  };

  const showTab = (index) => {
    setSelectedTab(index);
  };

  const expandAll = () => {
    document.querySelectorAll('details').forEach((section) => {
      section.open = true;
    });
  };

  const handleMouseOver = (event) => {
    event.target.style.backgroundColor = 'gray';
  };

  const handleMouseOut = (event) => {
    event.target.style.backgroundColor = 'black';
  };

  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.some(item => item.id === Courses.id)) return;
    cart.push(Courses);
    localStorage.setItem('cart', JSON.stringify(cart));
    setCart(cart);
    console.log('Cart updated:', cart);
    window.dispatchEvent(new Event('storage'));
  };

  const handleButtonClick = () => {
    if (Courses.price > 0) {
      if (!inCart) {
        handleAddToCart(Courses);
        setInCart(true);
      } else {
        navigate('/wishlist');
      }
    } else {
      setIsEnrolled(true);
      const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses')) || [];
      enrolledCourses.push(Courses.id);
      localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
      navigate('/coursePage/' + Courses.id);
    }
  };

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

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      const nextId = await getNextId();

      if (nextId === null) {
        console.error("Failed to generate next ID");
        return;
      }

      const response = await fetch("http://localhost:9999/AccessibleCourse", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: nextId,
          emailAddress: email,
          courseid: parseInt(id),
          enrolledTime: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log('Enrollment successful');
        navigate(`/courseEnroll?courseId=${id}&email=${email}`);
      } else {
        console.error('Enrollment failed');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  if (!AccessibleCourse || !Courses || Instructors.length === 0 || Profiles.length === 0) {
    return <p>Loading...</p>;
  }

  let priceDisplay;
  if (Courses.price > 0) {
    priceDisplay = <p><i className="bi bi-currency-dollar"></i> {Courses.price}</p>;
  } else {
    priceDisplay = <p>Free</p>;
  }

  const a = Instructors.find(c => c.id == Courses.instrucotor)?.emailAddress;
  const profile = Profiles.find(p => p.emailAddress == a)?.fullName;
  const imageInstructor = Profiles.find(p => p.emailAddress == a)?.profilePicture;
  const prof = Profiles.find(p => p.emailAddress == a);
  const ins = Instructors.find(c => c.id == Courses.instrucotor);

  const lines = Courses.courseDescription.trim().split('.').map(line => line.trim());
  const lines1 = Courses.objective.trim().split('.').map(line => line.trim());
  const lines2 = Courses.prerequiresite.trim().split('.').map(line => line.trim());

  return (
    <div className="container" style={{ maxWidth: "1840px" }}>
      <div className="row" style={{ padding: "20px 10%" }}>
        <div className="col-lg-5">
          <div className="ratio ratio-16x9">
            {Courses && (
              <div>
                <img className="w-100" src={`${Courses.thumbnail}`} style={{ width: '80%', height: '95%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-7">
          <div className="w-75">
            <h3>{Courses.courseName}</h3>
            <h5>{Courses.tagLine}</h5>
            <div className="pt-4">
              <h6>
                {Courses.badge && <span className="badge text-bg-warning">{Courses.badge}</span>}
              </h6>
              <h6>
                Created by
                <a href="#"> {profile}</a>
              </h6>
              <h5>
                {priceDisplay}
              </h5>
              <h6>Last updated <span className="text-success">{Courses.lastUpdatedTime}</span></h6>
              {AccessibleCourse.length > 0 ? (
                <Link to={`/coursePage/` + Courses.id}>
                  <button
                    style={{
                      backgroundColor: 'black',
                      width: '100%',
                      color: 'white',
                      padding: '10px',
                      transition: 'background-color 0.2s',
                      border: 'none',
                      borderRadius: '5px',
                      marginBottom: '10px'
                    }}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                  >
                    Go to Course
                  </button>
                </Link>
              ) : (
                email !== ins?.emailAddress && Courses.price > 0 ? (
                  <button
                    style={{
                      backgroundColor: 'black',
                      width: '100%',
                      color: 'white',
                      padding: '10px',
                      transition: 'background-color 0.2s',
                      border: 'none',
                      borderRadius: '5px',
                      marginBottom: '10px'
                    }}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    onClick={handleButtonClick}
                  >
                    {cart.some(item => item.id === Courses.id) ? 'Go to Wishlist' : 'Add to Wishlist'}
                  </button>
                ) : (
                  email !== ins?.emailAddress && Courses.price === 0 && (
                    <button
                      style={{
                        backgroundColor: 'black',
                        width: '100%',
                        color: 'white',
                        padding: '10px',
                        transition: 'background-color 0.2s',
                        border: 'none',
                        borderRadius: '5px',
                        marginBottom: '10px'
                      }}
                      onMouseOver={handleMouseOver}
                      onMouseOut={handleMouseOut}
                      onClick={handleAdd}
                    >
                      Enroll now
                    </button>
                  )
                )
              )}
              {email === ins?.emailAddress && (
                <button
                  style={{
                    backgroundColor: 'black',
                    width: '100%',
                    color: 'white',
                    padding: '10px',
                    transition: 'background-color 0.2s',
                    border: 'none',
                    borderRadius: '5px',
                    marginBottom: '10px'
                  }}
                  onMouseOver={handleMouseOver}
                  onMouseOut={handleMouseOut}
                  disabled
                >
                  Enroll Now (disabled)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {courseCertificate && (
        <div className="certificate-container">
          <h3>{Courses.courseName}</h3>
          <svg aria-hidden="true" fill="none" focusable="false" height="24" viewBox="0 0 24 24" width="24" className="m-r-1s css-duqyvt" id="cds-react-aria-21">
            <path d="M12 1a11 11 0 100 22 11 11 0 000-22zm-2 16.34l-4.71-4.7 1.42-1.42 3.29 3.3 7.29-7.3 1.42 1.42-8.71 8.7z" fill="currentColor"></path>
          </svg>
          <span className="css-4s48ix"><span>Completed on {courseCertificate.issuedDate}</span></span>
          <button onClick={() => navigate('/completeCertificate', {
            state: {
              course: Courses.courseName,
              instructor: profile,
              date: courseCertificate.issuedDate
            }
          })}>
            View Certificate
          </button>
        </div>
      )}
      <div style={{ padding: "20px 10%" }}>
        <button
          className={`btn p-3 m-0 tab ${selectedTab === 0 ? 'selected' : ''}`}
          type="button"
          onClick={() => showTab(0)}
        >
          Overview
        </button>
        <button
          className={`btn p-3 m-0 tab ${selectedTab === 1 ? 'selected' : ''}`}
          type="button"
          onClick={() => showTab(1)}
        >
          Course content
        </button>
        <button
          className={`btn p-3 m-0 tab ${selectedTab === 2 ? 'selected' : ''}`}
          type="button"
          onClick={() => showTab(2)}
        >
          Reviews
        </button>
        <button
          className={`btn p-3 m-0 tab ${selectedTab === 3 ? 'selected' : ''}`}
          type="button"
          onClick={() => showTab(3)}
        >
          Instructor
        </button>
        <hr className="m-0" />
        <div className="row">
          {selectedTab === 0 && (
            <div className="page col-6">
              <h5 className="pt-3">What you'll learn</h5>
              <ul>
                {lines1?.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
              <h5 className="pt-3">Description</h5>
              {lines?.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
          {selectedTab === 1 && (
            <div className="page col-6">
              <h5 className="pt-3">Requirements</h5>
              <ul>
                {lines2?.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
              <h5 className="pt-3">Sections</h5>
              <button className="btn" style={{ marginLeft: "75%", marginTop: "-60px" }} type="button" onClick={expandAll}>
                Expand all sections
              </button>
              <div className="pt-2">
                {Sessions?.map((session, index) => (
                  <details key={index}>
                    <summary className="border p-3">
                      <h6>{session.sesionTitle}</h6>
                    </summary>
                    <div className="border p-3">
                      {session.LessonList?.map((lesson, idx) => (
                        <div key={idx}>{lesson.name}</div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
          {selectedTab === 2 && (
            <div className="page col-6">
              <h5 className="pt-3">Student feedback</h5>
              <div className="row">
                <div className="col-3">
                  <div className="text-center" style={{ width: 'fit-content' }}>
                    <h1>{averageRating.toFixed(1)}</h1>
                    <div className="stars">
                      {renderStars(Math.round(averageRating))}
                    </div>
                    <h6>Course rating</h6>
                  </div>
                </div>
                <div className="col-8">
                  <div className="row">
                    {[...Array(5)].map((_, i) => {
                      const counter = 5 - i;
                      return (
                        <div className="col-12 mb-2" key={i}>
                          <div className="row align-items-center">
                            <div className="col-6">
                              <div className="progress rounded-progress" role="progressbar" aria-valuenow={starPercentages[counter - 1] || 0} aria-valuemin="0" aria-valuemax="100">
                                <div className="progress-bar" style={{ width: `${starPercentages[counter - 1] || 0}%` }}></div>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="d-flex justify-content-end">
                                <div className="stars">
                                  {renderStars(counter)}
                                </div>
                              </div>
                            </div>
                            <div className="col-2">
                              <div className="text-secondary">
                                {starPercentages[counter - 1] ? starPercentages[counter - 1].toFixed(1) : '0.0'}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-center mt-2">
                  <button
                    className="btn btn-dark"
                    onClick={() => setShowModal(true)}
                    disabled={!isEnrolled}
                  >
                    Rate this course
                  </button>
                </div>
                <div className="row">
                  <h5 className="pt-3">Comment</h5>
                  <div className="col-10">
                    {courseRatings.map((rating, index) => {
                      const profile = Profiles.find(profile => profile.emailAddress === rating.emailAddress);
                      return (
                        <div className="d-flex mb-2 border-bottom pb-2" key={index}>
                          <div className="col-2 me-3">
                            <div className="ratio ratio-1x1">
                              <img className="w-100 rounded-2" src={profile?.profilePicture} alt="Avatar" />
                            </div>
                          </div>
                          <div className="col">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <div>{profile?.fullName}</div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="stars">
                                {renderStars(rating.starRate)}
                              </div>
                              <div className="text-secondary">{new Date(rating.ratedTime).toLocaleString()}</div>
                            </div>
                            <p>{rating.comment}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={`modal ${showModal ? 'show' : ''}`} tabIndex="-1" role="dialog" style={{ display: showModal ? 'block' : 'none' }}>
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Rate this course</h5>
                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">Your Rating</label>
                          <div>
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`bi ${i < ratingForm.starRate ? 'bi-star-fill' : 'bi-star'}`}
                                onClick={() => handleStarClick(i + 1)}
                                style={{ cursor: 'pointer', fontSize: '1.5em', margin: '0 3px' }}
                              ></i>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Comment</label>
                          <textarea
                            className="form-control"
                            value={ratingForm.comment}
                            onChange={handleCommentChange}
                          ></textarea>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                        <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedTab === 3 && (
            <div className="page col-6">
              <div className="row">
                <h5 className="pt-3">Instructor</h5>
                <div className="col-3">
                  <img className="w-100" style={{ borderRadius: "50%" }} src={imageInstructor} alt="Instructor" />
                </div>
                <div className="col-9">
                  <p>{prof?.headline}</p>
                  <h6>
                    <Link to={`/detailProfile/${prof?.emailAddress}`}>{prof?.fullName}</Link>
                  </h6>
                  <span><i className="bi bi-star-fill"></i></span>
                  <span style={{ paddingLeft: "10px" }}>Instructor Rating <span className="text-secondary">(?)</span></span><br />
                  <span><i className="bi bi-people"></i></span>
                  <span style={{ paddingLeft: "10px" }}>Students <span className="text-secondary">(?)</span></span><br />
                  <span><i className="bi bi-play-btn"></i></span>
                  <span style={{ paddingLeft: "10px" }}>Courses <span className="text-secondary">(?)</span></span><br />
                </div>
                <div className="col-12 mt-3">
                  <p>{ins?.biography}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
