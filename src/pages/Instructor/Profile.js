import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './Profile.css';

export default function Profile() {
    const navigate = useNavigate();
    const {emailAddress}=useParams();
    const [courses, setCourses] = useState([]);
    const [instructor, setInstructor] = useState({});
    const [profiles, setProfiles] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [reviews, setReviews] = useState(0);

    useEffect(() => {
        if (emailAddress) {
            fetch(`http://localhost:9999/Instructors?emailAddress=${emailAddress}`)
                .then(res => res.json())
                .then(result => {
                    if (result.length > 0) {
                        const instructorData = result[0];
                        setInstructor(instructorData);
                        return fetch(`http://localhost:9999/Courses?instrucotor=${instructorData.id}`);
                    } else {
                        throw new Error('Instructor not found');
                    }
                })
                .then(res => res.json())
                .then(result => setCourses(result))
                .catch(err => console.log(err));

            fetch("http://localhost:9999/Profiles")
                .then(res => res.json())
                .then(result => setProfiles(result))
                .catch(err => console.log(err));
        }
    }, [emailAddress]);

    const profile = profiles.find(p => p.emailAddress === instructor.emailAddress);


    return (
        <div className="container pt-4 pb-4 d-flex" style={{ marginLeft: '20%' }}>
            <div className="row profile">
                <div className="col-6">
                    <h5>INSTRUCTOR</h5>
                    <h6 style={{ fontWeight: "bold" }}>{profile?.fullName}</h6>
                    <h6>{profile?.headline}</h6>
                    <div className="d-flex">
                        <div>
                            <div>Total students</div>
                            <div>{totalStudents}</div>
                        </div>
                        <div style={{ marginLeft: '15px' }}>
                            <div>Reviews</div>
                            <div>{reviews}</div>
                        </div>
                    </div><br /><br />
                    <h4 style={{ marginBottom: '-20px' }}>About me</h4><br />
                    <div className="mt-1">
                        {instructor.biography}
                    </div><br /><br />
                    <h4 style={{ marginTop: '-20px' }}>My courses ({courses.length})</h4><br />
                    <div className="row">
                        {courses.map((course) => {
                            const priceDisplay = course.price > 0 ? (
                                <p><i className="bi bi-currency-dollar"></i> {course.price}</p>
                            ) : (
                                <p>Free</p>
                            );

                            return (
                                <div key={course.id} className="col-6">
                                    <div className="card dropdown dropend" style={{ border: 'none' }}>
                                        <div className="ratio ratio-16x9 dropdown dropend">
                                            <img className="card-img-top" src={course.thumbnail} alt={course.name} />
                                        </div>
                                        <div className="card-body" style={{ paddingLeft: '0px' }}>
                                            <h6 className="m-0">{course.courseName}</h6>
                                            <h6>{priceDisplay}</h6>
                                            <h6>
                                                <span className="badge text-bg-warning">{course.badge}</span>
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="col-4">
                    <div>
                        <img src={profile?.profilePicture} alt="" style={{ width: '250px', height: '200px' }} />
                    </div>

                    <div className="btn-group">
                        <button>
                            <i style={{ fontSize: '15px' }} className="fa">&#xf082;</i>
                            Facebook
                        </button>
                    </div><br />
                    <div className="btn-group">
                        <button>
                            <i style={{ fontSize: '15px' }} className="fa">&#xf08c;</i>
                            LinkedIn
                        </button>
                    </div><br />
                    <div className="btn-group">
                        <button>
                            <i style={{ fontSize: '15px' }} className="fab">&#xf431;</i>
                            YouTube
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}