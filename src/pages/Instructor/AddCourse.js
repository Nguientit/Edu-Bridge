import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddCourse() {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState('addCourse');
    const [courseId, setCourseId] = useState("");
    const [nextId, setNextId] = useState("");
    const [email, setEmail] = useState("");
    const [instructorId, setInstructorId] = useState("");


    const showAddCoursePage = () => {
        setCurrentPage('addCourse');
    };

    const showAddSessionPage = () => {
        setCurrentPage('addSession');
    };


    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem('user'));
        if (storedUser) {
            setEmail(storedUser.emailAddress);
        }

        // Fetch existing courses to determine the next ID
        const fetchCourses = async () => {
            try {
                const response = await fetch("http://localhost:9999/Courses");
                if (!response.ok) {
                    throw new Error('Failed to fetch courses');
                }
                const courses = await response.json();
                const maxId = courses.reduce((max, course) => {
                    const courseId = parseInt(course.id, 10);
                    return courseId > max ? courseId : max;
                }, 0);
                setNextId((maxId + 1).toString());
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, []);

    const [courseData, setCourseData] = useState({
        id: nextId,
        instrucotor: parseInt(instructorId),
        courseName: '',
        courseDescription: '',
        thumbnail: '',
        tagLine: '',
        badge: '',
        objective: '',
        prerequiresite: '',
        intendedLearner: '',
        price: '',
        createdTime: () => new Date().toISOString(),
        visibility: 1,
        sessions: []
    });
    useEffect(() => {
        const fetchInstructor = async () => {
            try {
                const response = await fetch(`http://localhost:9999/Instructors?emailAddress=${email}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch instructor');
                }
                const instructors = await response.json();
                if (instructors.length > 0) {
                    setInstructorId(instructors[0].id);
                } else {
                    console.error('No instructor found for email:', email);
                }
            } catch (error) {
                console.error('Error fetching instructor:', error);
            }
        };

        if (email) {
            fetchInstructor();
        }
    }, [email]);


    useEffect(() => {

        setCourseData(prevData => ({
            ...prevData,
            id: nextId,
            instrucotor: parseInt(instructorId)
        }));
    }, [nextId, instructorId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourseData({ ...courseData, [name]: value });
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();

        try {
            const dataToSend = {
                ...courseData,
                createdTime: courseData.createdTime()
            };

            const response = await fetch("http://localhost:9999/Courses", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                throw new Error('Failed to add course');
            }

            const data = await response.json();
            console.log('Course added:', data);

            setCourseId(data.id);

            alert('Course added successfully!');

        } catch (error) {
            console.error('Error adding course:', error);
        }
    };

    const [sessionData, setSessionData] = useState({
        sesionTitle: '',
        LessonList: []
    });

    const handleSessionInputChange = (e) => {
        const { name, value } = e.target;
        setSessionData({
            ...sessionData,
            [name]: value
        });
    };

    const handleAddSession = async () => {
        if (!courseId) {
            alert("Please add a course first.");
            return;
        }

        try {
            const sessionToAdd = {
                course: parseInt(courseId),
                sesionTitle: sessionData.sesionTitle,
                LessonList: sessionData.LessonList
            };

            const response = await fetch("http://localhost:9999/Sessions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionToAdd)
            });

            if (!response.ok) {
                throw new Error('Failed to add session');
            }

            const data = await response.json();
            console.log('Session added:', data);

            setCourseData({
                ...courseData,
                sessions: [...courseData.sessions, data]
            });

            setSessionData({
                sesionTitle: '',
                LessonList: []
            });

            alert('Session added successfully!');
        } catch (error) {
            console.error('Error adding session:', error);
        }
    };

    const handleAddLesson = () => {

        setSessionData({
            ...sessionData,
            LessonList: [...sessionData.LessonList, { name: '', videoUrl: { path: '', time: '' }, readingContent: '' }]
        });
        alert(`Insert lesson ${newLessonIndex}`);

    };

    const handleLessonInputChange = (index, e) => {
        const { name, value } = e.target;
        const updatedLessons = [...sessionData.LessonList];
        const lessonKey = name.split('-')[0];
        updatedLessons[index] = {
            ...updatedLessons[index],
            [lessonKey]: lessonKey === 'videoUrl' ?
                { ...updatedLessons[index].videoUrl, [name.split('-')[1]]: value } :
                value
        };
        setSessionData({ ...sessionData, LessonList: updatedLessons });
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0]; // Lấy tệp đầu tiên từ danh sách tệp đã chọn
        if (file) {
            const reader = new FileReader(); // Đối tượng để đọc tệp
            reader.onload = function (e) {
                // Xử lý khi tệp được đọc thành công
                const thumbnailUrl = e.target.result; // Đường dẫn của tệp ảnh
                // Cập nhật state hoặc làm gì đó với đường dẫn ảnh (vd: gán vào courseData.thumbnail)
                handleInputChange({ target: { name: 'thumbnail', value: thumbnailUrl } });
            };
            reader.readAsDataURL(file); // Đọc tệp dưới dạng URL dữ liệu
        }
    };

    const newLessonIndex = sessionData.LessonList.length + 1;

    return (
        <div className="container" style={{ maxWidth: "1840px" }}>
            <div style={{ padding: "20px 10%" }}>
                <button
                    className={`btn p-3 m-0 tab ${currentPage === 'addCourse' ? 'selected' : ''}`}
                    type="button"
                    onClick={showAddCoursePage}
                >
                    Add Course
                </button>
                <button
                    className={`btn p-3 m-0 tab ${currentPage === 'addSession' ? 'selected' : ''}`}
                    type="button"
                    onClick={showAddSessionPage}
                >
                    Add Session and Lesson
                </button>
                <hr className="m-0" />
                <div className="row">
                    <div className="page col-6">
                        {currentPage === 'addCourse' && (
                            <>
                                <form onSubmit={handleAddCourse}>
                                    <div className="form-group">
                                        <label>Course Name:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="courseName"
                                            value={courseData.courseName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Course Description:</label>
                                        <textarea
                                            rows={3}
                                            className="form-control"
                                            name="courseDescription"
                                            value={courseData.courseDescription}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Thumbnail URL:</label>
                                        <input
                                            type="file"  // Sử dụng type là file để cho phép chọn ảnh từ máy tính
                                            className="form-control"
                                            name="thumbnail"
                                            onChange={handleFileSelect} // Xử lý sự kiện khi người dùng chọn tệp
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tag Line:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="tagLine"
                                            value={courseData.tagLine}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Badge:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="badge"
                                            value={courseData.badge}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Objective:</label>
                                        <textarea
                                            className="form-control"
                                            name="objective"
                                            value={courseData.objective}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Prerequisites:</label>
                                        <textarea
                                            className="form-control"
                                            name="prerequiresite"
                                            value={courseData.prerequiresite}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Intended Learner:</label>
                                        <textarea
                                            className="form-control"
                                            name="intendedLearner"
                                            value={courseData.intendedLearner}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price:</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            value={courseData.price}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ marginTop: "10px",borderRadius:"5px" }}>Create Course</button>
                                </form>
                            </>
                        )}
                        {currentPage === 'addSession' && (
                            <>
                                <form onSubmit={(e) => { e.preventDefault(); }}>
                                    <div style={{display:"flex"}}>
                                        <div className="form-group">
                                            <label>Session Title:</label>
                                            <input
                                                style={{width:"710px"}}
                                                type="text"
                                                className="form-control"
                                                name="sesionTitle"
                                                value={sessionData.sesionTitle}
                                                onChange={handleSessionInputChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <button type="button" className="btn btn-primary" style={{marginLeft:"10px",width:"150px",marginTop:"30px",height:"40px",borderRadius:"5px"}} onClick={handleAddSession}>Create Session</button>
                                        </div>
                                    </div>
                                    {sessionData.LessonList.map((lesson, index) => (
                                           <div key={index}>
                                           <div className="form-group">
                                               <div style={{fontWeight:"bold"}}>Lesson: {index + 1}</div>
                                               <label>Lesson Name:</label>
                                               <input
                                                   type="text"
                                                   className="form-control"
                                                   name={`name-${index}`}
                                                   value={lesson.name}
                                                   onChange={(e) => handleLessonInputChange(index, e)}
                                                   required
                                               />
                                           </div>
                                           <div className="form-group">
                                               <label>Video URL:</label>
                                               <input
                                                   type="text"
                                                   className="form-control"
                                                   name={`videoUrl-path-${index}`}
                                                   value={lesson.videoUrl.path}
                                                   onChange={(e) => handleLessonInputChange(index, e)}
                                               />
                                           </div>
                                           <div className="form-group">
                                               <label>Video Time:</label>
                                               <input
                                                   type="text"
                                                   className="form-control"
                                                   name={`videoUrl-time-${index}`}
                                                   value={lesson.videoUrl.time}
                                                   onChange={(e) => handleLessonInputChange(index, e)}
                                               />
                                           </div>
                                           <div className="form-group">
                                               <label>Reading Content:</label>
                                               <textarea
                                                   className="form-control"
                                                   name={`readingContent-${index}`}
                                                   value={lesson.readingContent}
                                                   onChange={(e) => handleLessonInputChange(index, e)}
                                               />
                                           </div>
                                       </div>
                                    ))}
                                    <button type="button" className="btn btn-primary" style={{ marginTop: "10px",borderRadius:"5px" }} onClick={handleAddLesson}>Add Lesson</button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
