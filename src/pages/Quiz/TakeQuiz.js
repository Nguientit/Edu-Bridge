import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';



export default function TakeQuiz() {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizTitle, setQuizTitle] = useState('');
    const [duration, setDuration] = useState(0);
    const [quizSessionId, setQuizSessionId] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const { quizId, dateTime } = useParams();

    const decodedDateTime = decodeURIComponent(dateTime);
    const email = "tuanpdhe171507@fpt.edu.vn";

    const isSubmittingRef = useRef(false); // Ref to track if submission is in progress

    useEffect(() => {
        fetch(`http://localhost:9999/Quiz?id=${quizId}`)
            .then(res => res.json())
            .then(result => {
                if (result.length > 0) {
                    const quizData = result[0];
                    setQuizTitle(quizData.title);

                    const durationInSeconds = parseDurationString(quizData.duration);
                    setDuration(durationInSeconds);

                    return fetch(`http://localhost:9999/Questions?quiz=${quizId}`)
                        .then(res => res.json())
                        .then(questionsData => {
                            const randomQuestions = getRandomQuestions(questionsData, quizData.numberQuestion);
                            setQuestions(randomQuestions);

                            const fetchAnswersPromises = randomQuestions.map(question =>
                                fetch(`http://localhost:9999/Answers?question=${question.id}`)
                                    .then(res => res.json())
                                    .then(answersData => ({
                                        questionId: question.id,
                                        answers: shuffleArray(answersData)
                                    }))
                            );

                            return Promise.all(fetchAnswersPromises);
                        });
                } else {
                    throw new Error('Quiz not found');
                }
            })
            .then(answersData => {
                const answersMap = answersData.reduce((acc, { questionId, answers }) => {
                    acc[questionId] = answers;
                    return acc;
                }, {});
                setAnswers(answersMap);
            })
            .catch(err => console.log(err));
    }, [quizId, dateTime]);

    useEffect(() => {
        let timer = null;
    
        if (duration > 0 && !submitted) {
            timer = setInterval(() => {
                setDuration(prevDuration => {
                    if (prevDuration <= 1) {
                        clearInterval(timer);
                        if (!isSubmittingRef.current) {
                            handleSubmit(true); // Auto submit when time reaches zero
                            isSubmittingRef.current = true;
                        }
                    }
                    return prevDuration - 1;
                });
            }, 1000);
        }
    
        return () => {
            clearInterval(timer);
        };
    }, [duration, submitted]);

    const handleChange = (questionId, answerId) => {
        setSelectedAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: answerId
        }));
    };

    const handleQuizSession = async () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const currentDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        try {
            const checkResponse = await fetch(`http://localhost:9999/QuizSession?quiz=${quizId}&emailAddress=${email}`);
            const existingSessions = await checkResponse.json();

            if (existingSessions.length > 0) {
                const quizSessionId = existingSessions[0].id;
                const updateResponse = await fetch(`http://localhost:9999/QuizSession/${quizSessionId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        quiz: parseInt(quizId),
                        emailAddress: email,
                        takedTime: decodedDateTime,
                        doneTime: currentDateTime,
                    }),
                });

                if (updateResponse.ok) {
                    console.log('QuizSession updated successfully');
                    return quizSessionId;
                } else {
                    console.error('Failed to update QuizSession');
                    return null;
                }
            } else {
                const randomId = Math.floor(Math.random() * 1000000) + 1;
                const response = await fetch("http://localhost:9999/QuizSession", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: parseInt(randomId),
                        quiz: parseInt(quizId),
                        emailAddress: email,
                        takedTime: decodedDateTime,
                        doneTime: currentDateTime,
                    }),
                });

                if (response.ok) {
                    const newSession = await response.json();
                    console.log('QuizSession added successfully');
                    return newSession.id;
                } else {
                    console.error('Failed to add QuizSession');
                    return null;
                }
            }
        } catch (error) {
            console.error('Error fetching data: ', error);
            return null;
        }
    };

    const handleSubmit = async (isAutoSubmit = false) => {
        if (isAutoSubmit || window.confirm('Are you sure you want to submit the quiz?')) {
            try {
                const sessionResponse = await handleQuizSession();
                if (sessionResponse) {
                    setQuizSessionId(sessionResponse);
                    await handleQuizRecord(sessionResponse);
                    setSubmitted(true); // Mark quiz as submitted
                    window.location.href = `/result/${sessionResponse}`;
                }
            } catch (error) {
                console.error('Error submitting quiz:', error);
            }
        }
    };

    const handleQuizRecord = async (quizSessionId) => {
        if (!quizSessionId) {
            console.error('QuizSessionId is required.');
            return;
        }

        try {
            const checkResponse = await fetch(`http://localhost:9999/QuizReCord?quizSessionId=${quizSessionId}`);
            if (!checkResponse.ok) {
                console.error(`Failed to fetch existing QuizRecords for quizSessionId ${quizSessionId}`);
                return;
            }

            const existingRecords = await checkResponse.json();

            if (existingRecords.length > 0) {
                const deletePromises = existingRecords.map(async record => {
                    const deleteResponse = await fetch(`http://localhost:9999/QuizReCord/${record.id}`, {
                        method: 'DELETE',
                    });
                    if (!deleteResponse.ok) {
                        console.error(`Failed to delete QuizRecord with id ${record.id}`);
                    } else {
                        console.log(`QuizRecord deleted successfully with id ${record.id}`);
                    }
                });

                await Promise.all(deletePromises);
            }

            const quizRecords = Object.keys(selectedAnswers).map(questionId => ({
                quizSessionId: parseInt(quizSessionId),
                questionId: parseInt(questionId),
                answerId: parseInt(selectedAnswers[questionId])
            }));

            const addPromises = quizRecords.map(async quizRecord => {
                const addResponse = await fetch("http://localhost:9999/QuizReCord", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(quizRecord),
                });

                if (addResponse.ok) {
                    console.log(`QuizRecord added successfully for questionId ${quizRecord.questionId}`);
                } else {
                    console.error(`Failed to add QuizRecord for questionId ${quizRecord.questionId}`);
                }
            });

            await Promise.all(addPromises);

            console.log('QuizRecords update completed');
        } catch (error) {
            console.error('Error handling QuizRecords: ', error);
        }
    };

    const getRandomQuestions = (questions, numberQuestion) => {
        const shuffled = questions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numberQuestion);
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const parseDurationString = (durationStr) => {
        if (!durationStr) return 0;

        const timePart = durationStr.match(/N'(\d{2}):(\d{2}):(\d{2})'/);
        if (!timePart) return 0;

        const hours = parseInt(timePart[1], 10);
        const minutes = parseInt(timePart[2], 10);
        const seconds = parseInt(timePart[3], 10);

        return hours * 3600 + minutes * 60 + seconds;
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    return (
        <div className="container-fluid border-bottom">
            <nav className="navbar">
                <div className="row p-2 w-100">
                    <div className="col-8 d-flex align-items-center">
                        <button className="btn btn-link" onClick={() => window.history.back()} style={{ textDecoration: 'none' }}>
                            <i className="bi bi-box-arrow-left"></i> Go back
                        </button>
                        <h6 className="mb-0 ms-2"><span>{quizTitle}</span></h6>
                    </div>
                    <div className="col-4 d-flex justify-content-end align-items-center">
                        <h6 className="mb-0">
                            <div id="timer" style={{ color: "red", fontSize: "20px", fontWeight: "bold" }}>
                                Time left: {formatTime(duration)}
                            </div>
                        </h6>
                    </div>
                </div>
            </nav>

            <form id="quizForm" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                {questions.map((q, index) => (
                    <div className="row row-cols-3 mt-4" key={q.id}>
                        <div className="col-1 text-end">{index + 1}.</div>
                        <div className="col-9 mb-4">
                            <div className="mb-4">
                                <span>{q.questionContent}</span>
                            </div>
                            {(answers[q.id] || []).map((a, i) => (
                                <div className="form-check mt-2" key={a.id}>
                                    <input
                                        className="form-check-input rounded-5"
                                        type="radio"
                                        name={`answer${index}`}
                                        id={`radio${index}${i}`}
                                        value={a.id}
                                        onChange={() => handleChange(q.id, a.id)}
                                        checked={selectedAnswers[q.id] === a.id}
                                    />
                                    <label className="form-check-label" htmlFor={`radio${index}${i}`}>{a.answerContent}</label>
                                </div>
                            ))}
                        </div>
                        <div className="col-1 text-end">1 point</div>
                    </div>
                ))}
                <div className="row mb-4">
                    <div className="col-1 text-end"></div>
                    <div className="col">
                        <input type="submit" className="btn mt-3" style={{ backgroundColor: "black", color: "white" }} value='Submit' />
                    </div>
                </div>
            </form>
        </div>
    );
}