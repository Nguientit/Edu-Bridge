import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Alert, ProgressBar } from 'react-bootstrap';

function calculateProgress(sessions) {
    const courseProgress = {};

    sessions.forEach(session => {
        const { course, LessonList } = session;

        if (!courseProgress[course]) {
            courseProgress[course] = { completed: 0, total: 0 };
        }

        LessonList.forEach(lesson => {
            courseProgress[course].total += 1;
            if (['watched', 'read', 'retakequiz'].includes(lesson.type)) {
                courseProgress[course].completed += 1;
            }
        });
    });

    // Calculate the percentage for each course
    for (const course in courseProgress) {
        const { completed, total } = courseProgress[course];
        courseProgress[course].percentage = (completed / total) * 100;
    }

    return courseProgress;
}


export default function MyCourse() {
    const [showModal, setShowModal] = useState(false);
    const [courseIdToUnenroll, setCourseIdToUnenroll] = useState(null);
    const [courses, setCourses] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [email, setEmail] = useState({});

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem('user'));
        if (storedUser) {
            setEmail(storedUser.emailAddress);
        }
    }, []);

    useEffect(() => {
        if (!email) {
            return; // Prevent fetch when email is not set
        }

        fetch(`http://localhost:9999/AccessibleCourse?emailAddress=${email}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch accessible courses');
                }
                return res.json();
            })
            .then(accessibleCourses => {
                if (accessibleCourses.length > 0) {
                    const fetchCourseDetails = accessibleCourses.map(course => {
                        return fetch(`http://localhost:9999/Courses?id=${course.courseid}`)
                            .then(res => {
                                if (!res.ok) {
                                    throw new Error('Failed to fetch course details');
                                }
                                return res.json();
                            });
                    });
                    return Promise.all(fetchCourseDetails);
                } else {
                    setCourses([]); // Clear courses if none accessible
                    throw new Error('No accessible courses found');
                }
            })
            .then(courseDetails => {
                const flattenedCourses = courseDetails.flat();

                const fetchSessionDetails = flattenedCourses.map(course => {
                    return fetch(`http://localhost:9999/Sessions?course=${course.id}`)
                        .then(res => {
                            if (!res.ok) {
                                throw new Error('Failed to fetch sessions');
                            }
                            return res.json();
                        })
                        .then(sessions => {
                            const progress = calculateProgress(sessions);
                            return { ...course, progress: progress[course.id]?.percentage || 0 };
                        });
                });

                return Promise.all(fetchSessionDetails);
            })
            .then(coursesWithProgress => {
                setCourses(coursesWithProgress);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setCourses([]); // Clear courses on error
            });

        fetch("http://localhost:9999/Profiles")
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch profiles');
                }
                return res.json();
            })
            .then(result => {
                setProfiles(result);
            })
            .catch(err => {
                console.error('Error fetching profiles:', err);
                setProfiles([]);
            });
    }, [email]);

    const handleShowModal = (courseId) => {
        setCourseIdToUnenroll(courseId);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCourseIdToUnenroll(null);
    };

    const openCoursePage = (courseId) => {
        window.location.href = `/news/${courseId}`;
    };

    const handleDelete = () => {
        fetch(`http://localhost:9999/AccessibleCourse?courseid=${courseIdToUnenroll}&emailAddress=${email}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch course for unenrollment');
                }
                return res.json();
            })
            .then(accessibleCourse => {
                if (accessibleCourse.length > 0) {
                    const idToDelete = accessibleCourse[0].id;
                    return fetch(`http://localhost:9999/AccessibleCourse/${idToDelete}`, {
                        method: 'DELETE',
                    });
                } else {
                    throw new Error('No matching course found for unenrollment');
                }
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to unenroll from course');
                }
                // Reload courses after successful deletion
                fetchCourses(email);
                handleCloseModal();
            })
            .catch(err => {
                console.error('Error deleting course:', err);
                // Handle error as needed
            });
    };

    const fetchCourses = (emailAddress) => {
        fetch(`http://localhost:9999/AccessibleCourse?emailAddress=${emailAddress}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch accessible courses');
                }
                return res.json();
            })
            .then(accessibleCourses => {
                if (accessibleCourses.length > 0) {
                    const fetchCourseDetails = accessibleCourses.map(course => {
                        return fetch(`http://localhost:9999/Courses?id=${course.courseid}`)
                            .then(res => {
                                if (!res.ok) {
                                    throw new Error('Failed to fetch course details');
                                }
                                return res.json();
                            });
                    });
                    return Promise.all(fetchCourseDetails);
                } else {
                    setCourses([]); // Clear courses if none accessible
                    throw new Error('No accessible courses found');
                }
            })
            .then(courseDetails => {
                const flattenedCourses = courseDetails.flat();

                const fetchSessionDetails = flattenedCourses.map(course => {
                    return fetch(`http://localhost:9999/Sessions?course=${course.id}`)
                        .then(res => {
                            if (!res.ok) {
                                throw new Error('Failed to fetch sessions');
                            }
                            return res.json();
                        })
                        .then(sessions => {
                            const progress = calculateProgress(sessions);
                            return { ...course, progress: progress[course.id]?.percentage || 0 };
                        });
                });

                return Promise.all(fetchSessionDetails);
            })
            .then(coursesWithProgress => {
                setCourses(coursesWithProgress);
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                setCourses([]); // Clear courses on error
            });
    };

    return (
        <Container className="mb-5">
            <div className="mb-4" style={{ marginTop: '10px' }}>
                <h4>My courses</h4>
            </div>
            <Row className="gx-3">
                {courses.length === 0 ? (
                    <Alert variant="info" className="text-dark">
                        <h6>You haven't enrolled in any courses yet.</h6>
                    </Alert>
                ) : (
                    courses.map((course) => (
                        <Col key={course.id} className="col-3">
                            <Card className="h-100 w-100">
                                <div className="ratio ratio-16x9 dropdown dropend border" onClick={() => openCoursePage(course.id)}>
                                    <Card.Img variant="top" src={course.thumbnail} />
                                </div>
                                <Card.Body onClick={() => openCoursePage(course.id)} style={{ overflow: 'hidden' }}>
                                    <Card.Title style={{ fontSize: '1rem' }}>{course.courseName}</Card.Title>
                                </Card.Body>
                                <Card.Footer>
                                    <ProgressBar
                                        now={course.progress}
                                        label={`${course.progress.toFixed(2)}%`}
                                    />
                                </Card.Footer>
                                <Button
                                    type="button"
                                    className="btn btn-secondary rounded-2"
                                    style={{ width: '120px',marginLeft:"95px" }}
                                    onClick={() => handleShowModal(course.id)}
                                >
                                    Unenroll
                                </Button>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Unenrollment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to unenroll from this course?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Unenroll
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );

}