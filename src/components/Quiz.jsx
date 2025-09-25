import React, { useState, useEffect } from 'react';
import QuizResult from './QuizResult';
import { Puff } from 'react-loader-spinner';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Quiz.css';

const API_URL = '/api/questions';

const Quiz = ({ settings, onBackToDashboard }) => {
    // ... all the state and functions from before remain the same ...
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [viewedQuestions, setViewedQuestions] = useState({});
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [quizDetails, setQuizDetails] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const fetchQuizQuestions = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Could not fetch quiz data.');
                const data = await response.json();
                
                let filteredQuestions = [];
                if (settings.type === 'Mixed') {
                    filteredQuestions = data.data.filter(q => q.difficulty === settings.difficulty);
                } else {
                    filteredQuestions = data.data.filter(q => q.questionType === settings.type && q.difficulty === settings.difficulty);
                }

                if (filteredQuestions.length === 0) {
                    throw new Error('No questions found for the selected criteria.');
                }
                
                setQuizQuestions(filteredQuestions);

                let timePerQuestion;
                switch (settings.difficulty) {
                    case 'Low':
                        timePerQuestion = 20;
                        break;
                    case 'High':
                        timePerQuestion = 40;
                        break;
                    case 'Medium':
                    default:
                        timePerQuestion = 30;
                        break;
                }
                
                setTimeLeft(filteredQuestions.length * timePerQuestion);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuizQuestions();
    }, [settings]);

    const submitQuiz = () => {
        if (timeLeft > 0 && !window.confirm("Are you sure you want to submit?")) {
            return;
        }
        
        let totalScore = 0, correctCount = 0, incorrectCount = 0;
        quizQuestions.forEach(q => {
            const userAnswer = userAnswers[q._id];
            if (userAnswer) {
                if (userAnswer === q.correctAnswer) {
                    totalScore += (q.marks || 1);
                    correctCount++;
                } else {
                    if (q.hasNegativeMarking) totalScore -= (q.negativeMarks || 0);
                    incorrectCount++;
                }
            }
        });

        setScore(totalScore);
        setQuizDetails({
            totalQuestions: quizQuestions.length,
            correct: correctCount,
            incorrect: incorrectCount,
            unattempted: quizQuestions.length - (correctCount + incorrectCount),
        });
        setShowResult(true);
    };

    useEffect(() => {
        if (timeLeft === null || showResult) return;
        if (timeLeft === 0) {
            submitQuiz();
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, showResult, submitQuiz]);
    
    const handleOptionSelect = (questionId, selectedOption) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    };

    const goToQuestion = (index) => {
        if (index >= 0 && index < quizQuestions.length) {
            setViewedQuestions(prev => ({ ...prev, [currentQuestionIndex]: true }));
            setCurrentQuestionIndex(index);
        }
    };

    if (isLoading) return <div className="loading-container"><Puff color="#00BFFF" /> Loading Quiz...</div>;
    if (error) return <div className="error-container">{error} <button onClick={onBackToDashboard} className="btn btn-primary mt-3">Back to Dashboard</button></div>;
    if (showResult) return <QuizResult score={score} details={quizDetails} onBackToDashboard={onBackToDashboard} />;

    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (!currentQuestion) return <div className="loading-container">Preparing questions...</div>;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="quiz-page-container">
            <div className="quiz-container animate-fade-in">
                <div className="quiz-main-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                           
                            <h2>{`${settings.type} Quiz`}</h2>
                            <p className="question-progress-text">
                                Question {currentQuestionIndex + 1} / {quizQuestions.length}
                            </p>
                        </div>
                        <div className={`quiz-timer ${timeLeft !== null && timeLeft <= 15 ? 'timer-warning' : ''}`}>
                            <i className="bi bi-clock-fill"></i> {timeLeft !== null ? formatTime(timeLeft) : '00:00'}
                        </div>
                    </div>
                    <div className="question-meta">
                        <span className={`badge me-2 difficulty-${(currentQuestion.difficulty || 'Medium').toLowerCase()}`}>{currentQuestion.difficulty || 'Medium'}</span>
                    </div>
                </div>
                <div className={`quiz-body ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                    <div className="quiz-content">
                        <div className="question-card">
                            
                            <p className="question-text">
                                {`${currentQuestionIndex + 1}. ${currentQuestion.questionText}`}
                            </p>
                            <div className="options-list">
                                {currentQuestion.options.map((option, index) => {
                                    const isChecked = userAnswers[currentQuestion._id] === option;
                                    return (
                                        <div className="option-item" key={index}>
                                            <input
                                                type="radio"
                                                id={`q${currentQuestion._id}-opt${index}`}
                                                name={`question-${currentQuestion._id}`}
                                                value={option}
                                                checked={isChecked}
                                                onChange={() => handleOptionSelect(currentQuestion._id, option)}
                                            />
                                            <label htmlFor={`q${currentQuestion._id}-opt${index}`}>{option}</label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="quiz-navigation">
                            <button className="btn btn-secondary nav-btn" onClick={() => goToQuestion(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0}>Back</button>
                            {currentQuestionIndex < quizQuestions.length - 1 ? (
                                <button className="btn btn-primary nav-btn" onClick={() => goToQuestion(currentQuestionIndex + 1)}>Next</button>
                            ) : (
                                <button className="btn btn-success nav-btn submit-btn" onClick={submitQuiz}>Submit Quiz</button>
                            )}
                        </div>
                    </div>
                    
                    <div className={`quiz-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                        <button className="btn btn-light sidebar-toggle-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title="Toggle Navigator">
                             <i className={`bi ${isSidebarCollapsed ? 'bi-chevron-bar-left' : 'bi-chevron-bar-right'}`}></i>
                        </button>
                        <div className="question-tracker">
                            <div className="tracker-grid">
                                {quizQuestions.map((q, index) => {
                                    const isCurrent = index === currentQuestionIndex;
                                    const isAnswered = !!userAnswers[q._id];
                                    const isViewed = !!viewedQuestions[index];
                                    let dotClass = `tracker-dot ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''} ${isViewed && !isAnswered ? 'viewed' : ''}`;
                                    return <button key={index} className={dotClass.trim()} onClick={() => goToQuestion(index)}>{index + 1}</button>;
                                })}
                            </div>
                             <div className="tracker-legend">
                                 <span><span className="dot answered"></span> Answered</span>
                                 <span><span className="dot viewed"></span> Viewed</span>
                                 <span><span className="dot"></span> Not Viewed</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Quiz;