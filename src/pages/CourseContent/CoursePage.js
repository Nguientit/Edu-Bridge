import React, { useContext, useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronForwardSharp, checkmarkCircleSharp, radioButtonOffSharp, book, videocam } from 'ionicons/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import Button from 'react-bootstrap/Button';
import { AuthContext } from '../Login/AuthContext';
import './CoursePage.css';

function CoursePage() {
    const { id } = useParams();
    const [sessions, setSessions] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [courseName, setCourseName] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [userLessonStatus, setUserLessonStatus] = useState([]);
    const [currentUserEmail, setCurrentUserEmail] = useState(''); 

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem('user'));
        if (storedUser) {
            setCurrentUserEmail(storedUser.emailAddress);
        }
      }, [])

    const [videoProgress, setVideoProgress] = useState(0);
    const [videoCurrentTime, setVideoCurrentTime] = useState('0:00');
    const [videoDuration, setVideoDuration] = useState('');
    const [hasVideoEnded, setHasVideoEnded] = useState(false);
    const [certificates, setCertificates] = useState([]);
    const [certificatesChecked, setCertificatesChecked] = useState(false);
    const [Profiles, setProfiles] = useState([]);
    const [Instructors, setInstructors] = useState([]);
    const [Courses, setCourses] = useState(null);
    const navigate = useNavigate();

    const { user } = useContext(AuthContext);


    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch(`http://localhost:9999/Sessions`);
                const result = await response.json();
                const filteredSessions = result.filter(session => session.course == id);
                setSessions(filteredSessions);

                if (filteredSessions.length > 0) {
                    let initialLesson = null;
                    for (let session of filteredSessions) {
                        if (session.LessonList.length > 0) {
                            initialLesson = session.LessonList[0];
                            break;
                        }
                    }
                    setCurrentLesson(initialLesson);
                }
            } catch (error) {
                console.error('Error fetching sessions:', error);
            }
        };

        const fetchCourse = async () => {
            try {
                const response = await fetch(`http://localhost:9999/Courses/`);
                const result = await response.json();
                const currentCourse = result.find(course => course.id == id);
                setCourseName(currentCourse.courseName);
            } catch (error) {
                console.error('Error fetching course:', error);
            }
        };

        const fetchUserLessonStatus = async () => {
            try {
                const response = await fetch(`http://localhost:9999/UserLessonStatus`);
                const result = await response.json();
                const currentUserStatus = result.find(status => status.emailAddress === currentUserEmail);
                setUserLessonStatus(currentUserStatus ? currentUserStatus.lessonStatuses : []);
            } catch (error) {
                console.error('Error fetching user lesson status:', error);
            }
        };

        const fetchCertificates = async () => {
            try {
                const response = await fetch(`http://localhost:9999/Certificates`);
                const result = await response.json();
                setCertificates(result);
            } catch (error) {
                console.error('Error fetching certificates:', error);
            }
        };

        fetchCourse();
        fetchSessions();
        fetchUserLessonStatus();
        fetchCertificates();

    }, [id, currentUserEmail]);

    useEffect(() => {
        const checkAndAddCertificates = async () => {
            let updatedSessions = [...sessions];

            for (let i = 0; i < updatedSessions.length; i++) {
                const session = updatedSessions[i];
                const isCompleted = session.LessonList.every(lesson => {
                    const lessonStatus = userLessonStatus.find(status => status.lessonId === lesson.id);
                    return lessonStatus && ['watched', 'read', 'retakequiz'].includes(lessonStatus.type);
                });

                if (isCompleted && !session.isCompleted) {
                    const existingCertificate = certificates.find(cert =>
                        cert.emailAddress === user.emailAddress && cert.session === session.id
                    );
                    if (!existingCertificate) {
                        await addCertificateToJson(session);
                        updatedSessions[i].isCompleted = true; // Đánh dấu session là đã hoàn thành
                    } else {
                        updatedSessions[i].isCompleted = true; // Đánh dấu session là đã hoàn thành
                    }
                }
            }

            setSessions(updatedSessions); // Cập nhật state để trigger re-render
            const allSessionsCompleted = updatedSessions.every(session => session.isCompleted);
            if (allSessionsCompleted) {
                await addCourseCertificate();
            }

            setCertificatesChecked(true); // Đánh dấu là đã kiểm tra và thêm chứng chỉ
        };

        if (!certificatesChecked && sessions.length > 0 && userLessonStatus.length > 0 && certificates.length > 0) {
            checkAndAddCertificates();
        }
    }, [sessions, userLessonStatus, certificates, user, certificatesChecked]);

    const addCertificateToJson = async (session) => {
        try {
            const response = await fetch('http://localhost:9999/Certificates');
            if (!response.ok) {
                throw new Error('Failed to fetch existing certificates');
            }
            const fetchedCertificates = await response.json();

            const existingCertificate = fetchedCertificates.find(cert =>
                cert.emailAddress == user.emailAddress && cert.session == session.id
            );
            if (existingCertificate) {
                console.log('Certificate already exists for this email address and session.');
                return;
            }

            const maxId = fetchedCertificates.reduce((max, certificate) => {
                const certificateId = parseInt(certificate.id, 10);
                return certificateId > max ? certificateId : max;
            }, 0);
            const newId = (maxId + 1).toString();

            const newCertificate = {
                id: newId,
                session: parseInt(session.id),
                name: `${session.sesionTitle} Session Certificate`,
                emailAddress: user.emailAddress,
                issuedDate: new Date().toISOString().split('T')[0]
            };

            const postResponse = await fetch('http://localhost:9999/Certificates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCertificate),
            });

            if (!postResponse.ok) {
                throw new Error('Failed to add new certificate');
            }

            const data = await postResponse.json();
            console.log('Certificate added:', data);
        } catch (error) {
            console.error('Error adding certificate:', error);
        }
    };

    const addCourseCertificate = async () => {
        try {
            const existingCourseCertificate = certificates.find(cert =>
                cert.emailAddress === user.emailAddress && cert.course === parseInt(id)
            );

            if (existingCourseCertificate) {
                console.log('Course certificate already exists for this email address.');
                return;
            }

            const maxId = certificates.reduce((max, certificate) => {
                const certificateId = parseInt(certificate.id, 10);
                return certificateId > max ? certificateId : max;
            }, 0);
            const newId = (maxId + 1).toString();

            const newCourseCertificate = {
                id: newId,
                course: parseInt(id),
                name: `${courseName} Course Certificate`,
                emailAddress: user.emailAddress,
                issuedDate: new Date().toISOString().split('T')[0]
            };

            const postResponse = await fetch('http://localhost:9999/Certificates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCourseCertificate),
            });

            if (!postResponse.ok) {
                throw new Error('Failed to add new course certificate');
            }

            const data = await postResponse.json();
            setCertificates(prevCertificates => [...prevCertificates, newCourseCertificate]);
            console.log('Course certificate added:', data);
        } catch (error) {
            console.error('Error adding course certificate:', error);
        }
    };

    const handleSelectLesson = (lesson, sessionId) => {
        setCurrentLesson(lesson);
        setSessionId(sessionId);

        setVideoProgress(0);
        setVideoCurrentTime('0:00');
        setVideoDuration('');
        setHasVideoEnded(false);
    };

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleVideoProgress = ({ playedSeconds, loadedSeconds, played }) => {
        const playedPercentage = played * 100;
        setVideoCurrentTime(formatTime(playedSeconds));
        setVideoDuration(formatTime(loadedSeconds));
        setVideoProgress(playedPercentage);

        if (playedPercentage >= 70 && !hasVideoEnded) {
            setHasVideoEnded(true);
            handleVideoEnd();
        }
    };

    const updateUserLessonStatus = async (lessonId, newType) => {
        try {
            const response = await fetch(`http://localhost:9999/UserLessonStatus`);
            const userStatusList = await response.json();
            let currentUserStatus = userStatusList.find(status => status.emailAddress === currentUserEmail);

            if (!currentUserStatus) {
                currentUserStatus = { emailAddress: currentUserEmail, lessonStatuses: [] };
                userStatusList.push(currentUserStatus);
            }

            const lessonStatus = currentUserStatus.lessonStatuses.find(status => status.lessonId === lessonId);
            if (lessonStatus) {
                lessonStatus.type = newType;
            } else {
                currentUserStatus.lessonStatuses.push({ lessonId, type: newType });
            }

            await fetch(`http://localhost:9999/UserLessonStatus/${currentUserStatus.id || ''}`, {
                method: currentUserStatus.id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(currentUserStatus)
            });

            setUserLessonStatus([...currentUserStatus.lessonStatuses]);

        } catch (error) {
            console.error('Error updating user lesson status:', error);
        }
    };

    const handleVideoEnd = async () => {
        try {
            if (currentLesson) {
                await updateUserLessonStatus(currentLesson.id, 'watched');
                setCurrentLesson({ ...currentLesson, type: 'watched' });
            }
        } catch (error) {
            console.error('Error updating lesson type:', error);
        }
    };

    const handleRead = async () => {
        try {
            if (currentLesson) {
                await updateUserLessonStatus(currentLesson.id, 'read');
                setCurrentLesson({ ...currentLesson, type: 'read' });
            }
        } catch (error) {
            console.error('Error updating lesson type:', error);
        }
    };

    const handleQuizCompletion = async () => {
        try {
            if (currentLesson) {
                await updateUserLessonStatus(currentLesson.id, 'retakequiz');
                setCurrentLesson({ ...currentLesson, type: 'retakequiz' });
            }
        } catch (error) {
            console.error('Error updating lesson type:', error);
        }
    };

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const currentDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const getLessonType = (lessonId) => {
        const status = userLessonStatus.find(status => status.lessonId === lessonId);
        return status ? status.type : 'notStarted';
    };

    const a = Instructors.find(c => c.id == Courses.instrucotor)?.emailAddress;
    const profile = Profiles.find(p => p.emailAddress == a)?.fullName;
    return (
        <div className="container-fluid border-bottom">
            <div className="container pt-3 pb-3" style={{ maxWidth: "1840px" }}>
                <h1>Course name: {courseName}</h1>

                {currentLesson && (
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-9 p-0" id="main">
                                {(getLessonType(currentLesson.id) === 'watching' || getLessonType(currentLesson.id) === "watched") && (
                                    <div>
                                        <h5 className="fw-bold">{currentLesson.name}</h5>
                                        {getLessonType(currentLesson.id) === "watching" && (
                                            <ReactPlayer
                                                id="video"
                                                width={1100}
                                                height={600}
                                                url={currentLesson.videoUrl.path}
                                                controls
                                                onProgress={handleVideoProgress}
                                            />
                                        )}
                                        {getLessonType(currentLesson.id) === "watched" && (
                                            <ReactPlayer
                                                id="video"
                                                width={1100}
                                                height={600}
                                                url={currentLesson.videoUrl.path}
                                                controls
                                                playing
                                            />
                                        )}
                                        <br />
                                        <p>{currentLesson.readingContent}</p>
                                    </div>
                                )}
                                {(getLessonType(currentLesson.id) === 'reading' || getLessonType(currentLesson.id) === "read") && (
                                    <div className="pt-5 pb-5" style={{ width: '50rem' }}>
                                        <h5 className="fw-bold">{currentLesson.name}</h5>
                                        <p>{currentLesson.readingContent}</p>
                                        {getLessonType(currentLesson.id) === "reading" && (
                                            <Button variant="primary" onClick={() => handleRead()}>Mark as completed</Button>
                                        )}
                                        {getLessonType(currentLesson.id) === "read" && (
                                            <Button variant="primary" >Completed</Button>
                                        )}
                                    </div>
                                )}
                                {(getLessonType(currentLesson.id) === 'takequiz' || getLessonType(currentLesson.id) === 'retakequiz') && (
                                    <div>
                                        <h5 className="fw-bold">{currentLesson.name}</h5>
                                        <p>{currentLesson.readingContent}</p>
                                        <Link
                                            to={{
                                                pathname: `/takeQuiz/${currentLesson.quizId}/${encodeURIComponent(currentDateTime)}`

                                            }}
                                        >
                                            <Button variant="primary" onClick={() => handleQuizCompletion()}>
                                                {getLessonType(currentLesson.id) === 'takequiz' ? 'Take Quiz' : 'Retake Quiz'}
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className="col-3 p-0 pt-0 border-start" style={{ height: '100vh' }} id="menu">
                                {sessions.map(session => (
                                    <details className="col-12" key={session.id}>
                                        <summary className="btn btn-light w-100 text-start rounded-0 p-3 border-bottom d-flex align-items-center justify-content-between">
                                            <div>
                                                <h6 className="fw-bold">
                                                    <IonIcon icon={chevronForwardSharp} className="fs-6 ms-3" />
                                                    {session.sesionTitle}
                                                </h6>
                                                <span className="fw-bold text-secondary">{session.LessonList.length} items</span>
                                            </div>
                                            {session.isCompleted && (
                                                <div onClick={() => navigate('/completeCertificate', {
                                                    state: {
                                                        course: courseName,
                                                        instructor: profile,
                                                        date: new Date().toISOString().split('T')[0],
                                                        sessionId: session.id,
                                                        sessionTitle: session.sesionTitle
                                                    }
                                                })}>
                                                    <svg width="32" height="32" fill="none" className="css-12k6kvn">
                                                        <path d="M25.2 13.2V.8H6.8v12.4" fill="#F2D049"></path>
                                                        <path d="M25.2 13.2V.8H6.8v12.4" stroke="#000" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                                                        <path d="M6.8 13.2c0 4.417 4.121 8 9.2 8 5.08 0 9.2-3.583 9.2-8" stroke="#000" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                                                        <path d="M25.334 9.333c3.313 0 6-3.513 6-6.666h-6" stroke="#000" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                                                        <path d="M6.667 9.333c-3.313 0-6-3.513-6-6.666h6" stroke="#000" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                                                        <path d="M10.447 28.667l-1.113 2.666M22.667 31.333H9.334M10.667 28.687c2.207 0 4-2.374 4-4.474v-2.86M21.554 28.667l1.113 2.666M21.334 28.687c-2.207 0-4-2.374-4-4.474v-2.86" stroke="#000" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                                                        <path d="m16 5.333 1.233 2.634L20 8.393l-2 2.047.473 2.893L16 11.967l-2.473 1.366L14 10.44l-2-2.047 2.767-.426L16 5.333z" fill="#FFEEAC" stroke="#000" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                                                    </svg>
                                                </div>
                                            )}
                                        </summary>
                                        {session.LessonList.map(lesson => (
                                            <div
                                                className={`p-3 rounded-0 w-100 text-start border-bottom ${currentLesson && currentLesson.id === lesson.id && sessionId === session.id ? 'lesson-selected' : ''}`}
                                                key={lesson.id}
                                                onClick={() => handleSelectLesson(lesson, session.id)}
                                            >
                                                <h6 className="fw-bold">
                                                    <IonIcon
                                                        icon={
                                                            getLessonType(lesson.id) === 'watched' || getLessonType(lesson.id) === 'read' || getLessonType(lesson.id) === 'retakequiz' ?
                                                                checkmarkCircleSharp :
                                                                getLessonType(lesson.id) === 'reading' || getLessonType(lesson.id) === 'read' ?
                                                                    book :
                                                                    getLessonType(lesson.id) === 'watching' || getLessonType(lesson.id) === 'watched' ?
                                                                        videocam :
                                                                        radioButtonOffSharp
                                                        }
                                                        className="fs-5 icon-style"
                                                        style={{ color: (getLessonType(lesson.id) === 'watched' || getLessonType(lesson.id) === 'read' || getLessonType(lesson.id) === 'retakequiz') ? 'green' : 'black' }}
                                                    />
                                                    {lesson.name}
                                                </h6>
                                                <span className="fw-bold text-secondary">{lesson.videoUrl && lesson.videoUrl.time ? `${lesson.videoUrl.time} minutes` : ''}</span>
                                            </div>
                                        ))}
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CoursePage;
