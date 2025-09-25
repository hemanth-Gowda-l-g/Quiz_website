import React from 'react';
import './QuizResult.css'; 

const QuizResult = ({ score, details, onBackToDashboard }) => {
    return (
        <div className="result-container">
            <div className="result-card">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-trophy-fill trophy-icon" viewBox="0 0 16 16">
                    <path d="M2.5.5A.5.5 0 0 1 3 .5h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255l.653.515c.164.13.284.31.346.513l.386 1.273c.048.158.058.328.03.485a.5.5 0 0 1-.62.41l-1.425-.356a.5.5 0 0 0-.537.255l-.653.515a.5.5 0 0 1-.692 0l-.653-.515a.5.5 0 0 0-.537-.255L5.5 15.5H5a.5.5 0 0 1-.499-.58l.386-1.273a.5.5 0 0 1 .346-.513l.653-.515c.16-.12.343-.207.537-.255L6.5 13.5v-2.173c-.955-.234-2.043-1.146-2.833-3.011a3 3 0 1 1-1.133-5.89A42.6 42.6 0 0 1 2.5 1.036V.5z"/>
                </svg>
                <h2 className="result-title">Quiz Completed!</h2>
                <p className="score-display">Your Final Score</p>
                <p className="score-value">{score}</p>
                <div className="result-details">
                    <div className="detail-item"><span>Total Questions</span><strong>{details.totalQuestions}</strong></div>
                    <div className="detail-item"><span>Correct Answers</span><strong className="correct">{details.correct}</strong></div>
                    <div className="detail-item"><span>Incorrect Answers</span><strong className="incorrect">{details.incorrect}</strong></div>
                    <div className="detail-item"><span>Unattempted</span><strong>{details.unattempted}</strong></div>
                </div>
                {/* This button now calls the function passed from App.jsx */}
                <button className='btn btn-primary mt-4 btn-lg retake-btn' onClick={onBackToDashboard}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default QuizResult;