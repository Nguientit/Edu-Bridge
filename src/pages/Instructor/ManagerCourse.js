import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import sendEmail from '../emailService';

export default function ManagerCourse() {

    const [course, setCourse] = useState([]);
    const [instructor, setInstructor] = useState([]);
    const [category, setCategory] = useState([]);
    const [profile, setProfile] = useState([]);


    useEffect(() => {
        fetch("http://localhost:9999/Courses")
            .then(res => res.json())
            .then(result => setCourse(result))
            .catch(err => console.log(err));
        fetch("http://localhost:9999/Instructors")
            .then(res => res.json())
            .then(result => setInstructor(result))
            .catch(err => console.log(err));
        fetch("http://localhost:9999/Categories")
            .then(res => res.json())
            .then(result => setCategory(result))
            .catch(err => console.log(err));
        fetch("http://localhost:9999/Profiles")
            .then(res => res.json())
            .then(result => setProfile(result))
            .catch(err => console.log(err));
    }, []);

    const handleUpdate = async (id, currentStatus) => {
        const newStatus = currentStatus === 0 ? 1 : 0;

        try {
            const res = await fetch(`http://localhost:9999/Courses/${id}`);
            const course = await res.json();
            const updatedCourse = { ...course, visibility: newStatus };

            const instructorData = instructor.find(i => i.id == course.instrucotor);
            const profileData = profile.find(p => p.emailAddress == instructorData.emailAddress);

            if (newStatus === 0 && profileData) {
                const emailParams = {
                    service_id: 'service_l5yponw',
                    template_id: 'template_sfct4m7',
                    user_id: 'yIhKkqg23Ot_dgm85',
                    to_email: instructorData.emailAddress,
                    subject: "Your course has been deactivated",
                    coursename: course.courseName,
                    message: `
                    Hello ${profileData.fullName},
                `
                };
                await sendEmail(emailParams);
            }

            await fetch(`http://localhost:9999/Courses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedCourse)
            });

            setCourse(prevCourses => prevCourses.map(c => c.id == id ? { ...c, visibility: newStatus } : c));
        } catch (err) {
            console.log(err);
        }
    };



    return (
        <div>
            <Container fluid>
                <Row>
                    <Col>
                        <Container fluid>
                            <Row>
                                <Col>
                                    <h2 style={{ textAlign: "center" }}>Manager Course</h2>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <Form>
                                        <Table hover striped bordered>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Category Name</th>
                                                    <th>Course Name</th>
                                                    <th>Price</th>
                                                    <th>Created Time</th>
                                                    <th>Last Updated Time</th>
                                                    <th>Instructor Name</th>
                                                    <th>Status</th>
                                                    <th>Change status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {course?.map(p => {
                                                    const categoryName = category?.find(d => d.id == p.category)?.categoryName;
                                                    const ins = instructor?.find(i => i.id == p.instrucotor)?.emailAddress;
                                                    const profileName = profile?.find(a => a.emailAddress == ins)?.fullName;

                                                    let priceDisplay;
                                                    if (p.price > 0) {
                                                        priceDisplay = <p><i className="bi bi-currency-dollar"></i> {p.price}</p>;
                                                    } else {
                                                        priceDisplay = <p>Free</p>;
                                                    }

                                                    return (
                                                        <tr key={p.id}>
                                                            <td>{p.id}</td>
                                                            <td>{categoryName}</td>
                                                            <td>{p.courseName}</td>
                                                            <td>{priceDisplay}</td>
                                                            <td>{p.createdTime}</td>
                                                            <td>{p.lastUpdatedTime}</td>
                                                            <td>{profileName}</td>
                                                            <td>
                                                                <div style={{ display: "flex", justifyContent: "center", justifyItems: "center" }}>
                                                                    {p.visibility === 0 ? (
                                                                        <span style={{ backgroundColor: 'red', color: 'white', padding: '5px' }}>Inactive</span>
                                                                    ) : (
                                                                        <span style={{ backgroundColor: 'green', color: 'white', padding: '5px' }}>Active</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <Button variant='success' onClick={() => handleUpdate(p.id, p.visibility)}>Change</Button>
                                                            </td>
                                                           
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </Form>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}