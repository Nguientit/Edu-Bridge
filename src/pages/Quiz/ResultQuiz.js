import { Link, useNavigate, useParams } from "react-router-dom";

import React, { useState, useEffect } from 'react';

export default function ResultQuiz() {
    const [quizRecords, setQuizRecords] = useState([]);
    const [totalScore, setTotalScore] = useState(0);
    const [passed, setPassed] = useState(false);
    const [quizSession, setQuizSession] = useState(null);
    const { quizSessionId } = useParams();
    const [sessions, setSession] = useState([]);


    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const quizRecordResponse = await fetch(`http://localhost:9999/QuizReCord?quizSessionId=${quizSessionId}`);
                if (!quizRecordResponse.ok) {
                    throw new Error('Failed to fetch quiz records');
                }
                const quizRecordData = await quizRecordResponse.json();

                const questionsResponse = await fetch(`http://localhost:9999/Questions`);
                const answersResponse = await fetch(`http://localhost:9999/Answers`);
                if (!questionsResponse.ok || !answersResponse.ok) {
                    throw new Error('Failed to fetch questions or answers');
                }
                const questionsData = await questionsResponse.json();
                const answersData = await answersResponse.json();

                const formattedQuizRecords = quizRecordData.map(record => {
                    const question = questionsData.find(q => q.id == record.questionId);
                    const correctAnswer = answersData.find(a => a.question == record.questionId && a.correctless);
                    const allAnswers = answersData.filter(a => a.question == record.questionId);
                    const selectedAnswer = answersData.find(a => a.id == record.answerId);

                    return {
                        question,
                        allAnswers,
                        selectedAnswer,
                        correctAnswerId: correctAnswer.id
                    };
                });

                const totalPoints = formattedQuizRecords.reduce((total, record) => {
                    return total + (record.selectedAnswer.correctless ? 1 : 0);
                }, 0);

                const numberQuestion = formattedQuizRecords.length;
                const passedTarget = 50; // Assume 50% is the passing mark, you can fetch it dynamically

                const scorePercentage = (totalPoints / numberQuestion) * 100;
                const passedQuiz = scorePercentage >= passedTarget;

                setQuizRecords(formattedQuizRecords);
                setTotalScore(scorePercentage);
                setPassed(passedQuiz);

                const quizSessionResponse = await fetch(`http://localhost:9999/QuizSession/${quizSessionId}`);
                if (!quizSessionResponse.ok) {
                    throw new Error('Failed to fetch quiz session');
                }
                const quizSessionData = await quizSessionResponse.json();
                setQuizSession(quizSessionData);
            } catch (error) {
                console.error('Error fetching quiz data:', error);
            }
        };
        fetch("http://localhost:9999/Sessions")
            .then(res => res.json())
            .then(result => setSession(result))
            .catch(err => console.log(err));

        fetchQuizData();
    }, [quizSessionId]);

    if (quizRecords.length === 0) {
        return <div>Loading...</div>;
    }
    return (
        <div className="container-fluid border-bottom">
            <nav className="navbar">
                <div className="row p-2 w-100">
                    <div className="col-8 d-flex align-items-center">
                        <a className="btn btn-link" href="/" style={{ textDecoration: 'none' }}>
                            <ion-icon name="arrow-back-outline" role="img" className="md hydrated"></ion-icon> Go back
                        </a>
                        <h6 className="mb-0 ms-2"><span>{quizSession?.quizTitle || 'Quiz Title'}</span></h6>
                    </div>
                    <div className="col-4 d-flex justify-content-end align-items-center">
                        <h6 className="mb-0"><span>Due Time</span> {quizSession?.doneTime}</h6>
                    </div>
                </div>
            </nav>

            <div className="container-fluid p-4 border-bottom" id="notify">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col d-flex align-items-center">
                            <div className="me-2" id="icon"></div>
                            <div>
                                <h5 className="mb-0">{passed ? 'Congratulations! You passed!' : 'You did not pass.'}</h5>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-2" style={{ marginLeft: '24px' }}>
                        <div className="col">
                            <div>Grade received <span className={`fw-bold ${passed ? 'text-success' : 'text-danger'}`}>{totalScore}%</span></div>
                        </div>
                        <div className="col">
                            <div>To pass <span className="fw-bold">50%</span> or higher</div>
                        </div>
                        <div className="col text-end">
                            <Link to={`/coursePage/1`}>
                                <button className="btn btn-dark">
                                    Next
                                </button>
                            </Link>

                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-5 mb-5 w-75">
                {quizRecords.map((record, index) => (
                    <div className="row row-cols-3 mt-4" key={index}>
                        <div className="col-1 text-end fw-medium">{index + 1}.</div>
                        <div className="col-9 mb-4">
                            <div className="mb-4 fw-medium">
                                <span>{record.question ? record.question.questionContent : 'Question not found'}</span>
                            </div>
                            {record.allAnswers.map(answer => (
                                <div
                                    className={`form-check mt-2 ${answer.correctless ? 'bg-success-subtle' : record.selectedAnswer.id == answer.id ? 'bg-danger' : ''}`}
                                    key={answer.id}
                                >
                                    <input
                                        className="form-check-input rounded-5"
                                        type="radio"
                                        name={`radio-${record.question.id}`}
                                        checked={record.selectedAnswer.id == answer.id}
                                        readOnly
                                    />
                                    <label className="form-check-label">
                                        {answer.answerContent}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="col-1 text-end fw-medium">
                            {record.selectedAnswer.correctless ? '1/1 point' : '0/1 point'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}