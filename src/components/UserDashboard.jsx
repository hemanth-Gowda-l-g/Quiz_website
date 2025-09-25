import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Puff } from 'react-loader-spinner';
import './UserDashboard.css';


const API_URL = '/api/questions';


const UserDashboard = ({ onStartQuiz }) => {
    const { state,dispatch } = useAuth();
    const navigate = useNavigate();
    const [allQuestions, setAllQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);


    useEffect(() => {
        const fetchAllQuestions = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Could not fetch quiz data.');
                const data = await response.json();
                setAllQuestions(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllQuestions();
    }, []);
    

    const handleQuizAttempt = (type, difficulty) => {
        if (state.isAuthenticated && state.user) {
            onStartQuiz(type, difficulty);
        } else {
            setShowLoginModal(true);
        }
    };
    const handleLogin = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };


    const { quizTypes, totalQuestions, allDifficulties } = useMemo(() => {
        const types = new Map();
        allQuestions.forEach(q => {
            if (!types.has(q.questionType)) {
                types.set(q.questionType, {
                    questionCount: 0,
                    difficulties: new Set()
                });
            }
            const typeData = types.get(q.questionType);
            typeData.questionCount++;
            typeData.difficulties.add(q.difficulty);
        });
        const allDifficultiesSet = new Set(allQuestions.map(q => q.difficulty));
        return {
            quizTypes: Array.from(types.entries()).map(([name, data]) => ({
                name, ...data, difficulties: Array.from(data.difficulties)
            })),
            totalQuestions: allQuestions.length,
            allDifficulties: allDifficultiesSet
        };
    }, [allQuestions]);

    if (isLoading) return <div className="loading-container"><Puff color="#00BFFF" /> Loading Quizzes...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <>
            <div className="dashboard-container">
                <h1 className="dashboard-title">Select a Quiz</h1>
                <div className="quiz-type-grid">
                    <div className="quiz-type-card mixed-quiz-card">
                         <div className="card-content">
                            <h3 className="quiz-type-name">Mixed Topics</h3>
                            <p className="question-count">{totalQuestions} Questions Available</p>
                            <div className="difficulty-selector">
                                <p>Select Difficulty:</p>
                                <div className="difficulty-buttons">
                                    {['Low', 'Medium', 'High'].map(level => {
                                        const isAvailable = allDifficulties.has(level);
                                        return (
                                            <button
                                                key={level}
                                                className={`difficulty-btn difficulty-${level.toLowerCase()}`}
                                                disabled={!isAvailable}
                                                onClick={() => handleQuizAttempt('Mixed', level)}>
                                                {level}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    {quizTypes.map(type => (
                        <div key={type.name} className="quiz-type-card">
                            <div className="card-content">
                                <h3 className="quiz-type-name">{type.name}</h3>
                                <p className="question-count">{type.questionCount} Questions Available</p>
                                <div className="difficulty-selector">
                                    <p>Select Difficulty:</p>
                                    <div className="difficulty-buttons">
                                        {['Low', 'Medium', 'High'].map(level => {
                                            const isAvailable = type.difficulties.includes(level);
                                            return (
                                                <button
                                                    key={level}
                                                    className={`difficulty-btn difficulty-${level.toLowerCase()}`}
                                                    disabled={!isAvailable}
                                                    onClick={() => handleQuizAttempt(type.name, level)}>
                                                    {level}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Modal show={showLoginModal}  onHide={() => setShowLoginModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Login Required</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>You must be logged in to attempt a quiz.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
                        Close
                    </Button>
                    
                        <button className="btn btn-primary" onClick={handleLogin}>Login</button>
                   
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UserDashboard;

