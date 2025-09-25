import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Button } from 'react-bootstrap';
import './AdminPanel.css';

const API_URL = '/api/questions';

const AdminPanel = () => {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- New State for Filtering ---
    const [filterType, setFilterType] = useState('All');

    // State for the "Add Question" form
    const [newQuestion, setNewQuestion] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        questionType: 'Aptitude', 
        difficulty: 'Medium', 
        marks: 1,
        hasNegativeMarking: false,
        negativeMarks: 0,
    });

    // State for the "Edit Question" modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);

    const fetchQuestions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            // Sort questions by type, then by creation date
            const sortedData = data.data.sort((a, b) => {
                if (a.questionType < b.questionType) return -1;
                if (a.questionType > b.questionType) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setQuestions(sortedData);
            setError(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    // --- Logic for Grouping and Filtering Questions ---
    const questionTypes = useMemo(() => ['All', ...new Set(questions.map(q => q.questionType))], [questions]);

    const groupedAndFilteredQuestions = useMemo(() => {
        const filtered = filterType === 'All'
            ? questions
            : questions.filter(q => q.questionType === filterType);

        return filtered.reduce((acc, q) => {
            (acc[q.questionType] = acc[q.questionType] || []).push(q);
            return acc;
        }, {});
    }, [questions, filterType]);


    const handleNewInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewQuestion(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNewOptionChange = (index, value) => {
        const updatedOptions = [...newQuestion.options];
        updatedOptions[index] = value;
        setNewQuestion(prev => ({ ...prev, options: updatedOptions }));
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        const questionToAdd = {
            ...newQuestion,
            options: newQuestion.options.filter(opt => opt.trim() !== ''),
            negativeMarks: newQuestion.hasNegativeMarking ? newQuestion.negativeMarks : 0,
        };

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questionToAdd),
            });
            if (!res.ok) throw new Error('Failed to add question');
            
            // Reset form
            setNewQuestion({
                questionText: '', options: ['', '', '', ''], correctAnswer: '',
                questionType: 'Aptitude', difficulty: 'Medium',
                marks: 1, hasNegativeMarking: false, negativeMarks: 0,
            });

            fetchQuestions();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchQuestions();
        } catch (error) {
            alert('Failed to delete question.');
        }
    };

    const handleEditClick = (question) => {
        const options = [...question.options];
        while (options.length < 4) {
            options.push('');
        }
        setCurrentQuestion({ ...question, options });
        setShowEditModal(true);
    };

    const handleUpdateQuestion = async () => {
        if (!currentQuestion) return;
        
        const questionToUpdate = {
            ...currentQuestion,
            options: currentQuestion.options.filter(opt => opt.trim() !== ''),
             negativeMarks: currentQuestion.hasNegativeMarking ? currentQuestion.negativeMarks : 0,
        };

        try {
            const res = await fetch(`${API_URL}/${currentQuestion._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questionToUpdate)
            });
            if (!res.ok) throw new Error('Failed to update question');
            setShowEditModal(false);
            fetchQuestions();
        } catch (error) {
            alert(error.message);
        }
    };
    
    const handleEditInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentQuestion(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditOptionChange = (index, value) => {
        const updatedOptions = [...currentQuestion.options];
        updatedOptions[index] = value;
        setCurrentQuestion(prev => ({...prev, options: updatedOptions}));
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}. Make sure the backend is running.</div>;

    return (
        <div className="container mt-4">
            <h1 className="mb-4 main-title">Quiz Admin Panel</h1>
            <div className="row">
                {/* Add Question Form */}
                <div className="col-lg-5 mb-4 add-question-card">
                    <div className="card">
                        <div className="card-header">
                             <h5 className="card-title">Add New Question</h5>
                        </div>
                        <div className="card-body">
                             <form onSubmit={handleAddQuestion}>
                                <div className="mb-3">
                                    <label htmlFor="questionText" className="form-label">Question Text</label>
                                    <textarea className="form-control" name="questionText" value={newQuestion.questionText} onChange={handleNewInputChange} required />
                                </div>
                                
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Question Type</label>
                                        <input type="text" className="form-control" name="questionType" value={newQuestion.questionType} onChange={handleNewInputChange} placeholder="e.g., Aptitude, Coding" required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Difficulty</label>
                                        <select className="form-select" name="difficulty" value={newQuestion.difficulty} onChange={handleNewInputChange} required>
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>

                                {newQuestion.options.map((opt, index) => (
                                    <div className="mb-2" key={index}>
                                        <label className="form-label">Option {index + 1}</label>
                                        <input type="text" className="form-control" value={opt} onChange={e => handleNewOptionChange(index, e.target.value)} />
                                    </div>
                                ))}
                                <div className="mb-3">
                                    <label className="form-label">Correct Answer</label>
                                    <select className="form-select" name="correctAnswer" value={newQuestion.correctAnswer} onChange={handleNewInputChange} required>
                                        <option value="" disabled>Select...</option>
                                        {newQuestion.options.filter(o => o).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <label className="form-label">Marks</label>
                                        <input type="number" className="form-control" name="marks" min="1" value={newQuestion.marks} onChange={handleNewInputChange} />
                                    </div>
                                    <div className="col form-check align-self-end mb-3">
                                        <input type="checkbox" className="form-check-input" name="hasNegativeMarking" checked={newQuestion.hasNegativeMarking} onChange={handleNewInputChange} />
                                        <label className="form-check-label">Enable Negative Marks</label>
                                    </div>
                                </div>
                                {newQuestion.hasNegativeMarking && (
                                     <div className="mb-3">
                                         <label className="form-label">Negative Marks</label>
                                         <input type="number" className="form-control" name="negativeMarks" min="0" value={newQuestion.negativeMarks} onChange={handleNewInputChange}/>
                                     </div>
                                )}
                                <button type="submit" className="btn btn-primary w-100">Add Question</button>
                             </form>
                        </div>
                    </div>
                </div>

                {/* Question List */}
                <div className="col-lg-7">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                         <h2>Existing Questions ({questions.length})</h2>
                         <div className="filter-container">
                            <label htmlFor="typeFilter" className="form-label me-2">Filter by Type:</label>
                            <select id="typeFilter" className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                                {questionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                         </div>
                    </div>
                    <div id="questions-list" className="row row-cols-1 g-4">
                       {Object.keys(groupedAndFilteredQuestions).map(type => (
                           <div key={type}>
                               <h4 className="question-group-header">{type}</h4>
                               {groupedAndFilteredQuestions[type].map(q => (
                                   <div key={q._id} className="col mb-4">
                                       <div className="card">
                                           <div className="card-header d-flex justify-content-between align-items-center">
                                              <h5 className="card-title mb-0">{q.questionText}</h5>
                                              <div className="action-buttons">
                                                   {/* --- THIS IS THE FIX --- */}
                                                   <span className={`badge me-2 difficulty-${(q.difficulty || 'Medium').toLowerCase()}`}>{q.difficulty || 'Medium'}</span>
                                                   <span className="badge bg-success">Marks: {q.marks || 1}</span>
                                                   {q.hasNegativeMarking && <span className="badge bg-danger">Neg: {q.negativeMarks}</span>}
                                                   <button className="btn btn-warning btn-sm" onClick={() => handleEditClick(q)}>Edit</button>
                                                   <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q._id)}>Delete</button>
                                              </div>
                                           </div>
                                           <ul className="list-group list-group-flush">
                                               {q.options.map((opt, i) => (
                                                   <li key={i} className={`list-group-item ${opt === q.correctAnswer ? 'correct-answer' : ''}`}>
                                                       {opt} {opt === q.correctAnswer && <strong>(Correct)</strong>}
                                                   </li>
                                               ))}
                                           </ul>
                                       </div>
                                    </div>
                               ))}
                           </div>
                       ))}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Question</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentQuestion && (
                         <form>
                             <div className="mb-3">
                                 <label className="form-label">Question Text</label>
                                 <textarea className="form-control" name="questionText" value={currentQuestion.questionText} onChange={handleEditInputChange} required />
                             </div>
                              <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Question Type</label>
                                        <input type="text" className="form-control" name="questionType" value={currentQuestion.questionType} onChange={handleEditInputChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Difficulty</label>
                                        <select className="form-select" name="difficulty" value={currentQuestion.difficulty} onChange={handleEditInputChange} required>
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>
                             {currentQuestion.options.map((opt, index) => (
                                <div className="mb-2" key={index}>
                                    <label className="form-label">Option {index + 1}</label>
                                    <input type="text" className="form-control" value={opt} onChange={e => handleEditOptionChange(index, e.target.value)} />
                                </div>
                             ))}
                             <div className="mb-3">
                                 <label className="form-label">Correct Answer</label>
                                 <select className="form-select" name="correctAnswer" value={currentQuestion.correctAnswer} onChange={handleEditInputChange} required>
                                     {currentQuestion.options.filter(o => o).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                 </select>
                             </div>
                             <div className="row">
                                 <div className="col">
                                     <label className="form-label">Marks</label>
                                     <input type="number" className="form-control" name="marks" min="1" value={currentQuestion.marks} onChange={handleEditInputChange} />
                                 </div>
                                 <div className="col form-check align-self-end mb-3">
                                     <input type="checkbox" className="form-check-input" name="hasNegativeMarking" checked={currentQuestion.hasNegativeMarking} onChange={handleEditInputChange} />
                                     <label className="form-check-label">Enable Negative Marks</label>
                                 </div>
                             </div>
                              {currentQuestion.hasNegativeMarking && (
                                     <div className="mb-3">
                                         <label className="form-label">Negative Marks</label>
                                         <input type="number" className="form-control" name="negativeMarks" min="0" value={currentQuestion.negativeMarks} onChange={handleEditInputChange}/>
                                     </div>
                                )}
                         </form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleUpdateQuestion}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminPanel;

