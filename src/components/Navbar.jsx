import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { state, dispatch } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };
    const handleLogin = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };
    

    return (
        <nav className="quiz-navbar">
            <div className="container-fluid d-flex justify-content-between">
                <Link className="navbar-brand mb-0 h1" to="/">Quiz Platform</Link>
                <div>
                    {state.isAuthenticated ? (
                        <>
                            <span className="navbar-text me-3">
                                Welcome, {state.user?.username || 'User'}   
                            </span>
                        
                            
                            {state.user?.role === 'admin' && (
                                <Link className="btn btn-outline-secondary me-2" to="/admin">Admin Panel</Link>
                            )}
                            {state.user !== null && (
                            <button className="btn btn-primary" onClick={handleLogout}>Logout</button>)}
                            {state.user === null && (
                            <button className="btn btn-primary" onClick={handleLogin}>Login</button>)}
                        </>
                    ) : (
                        <>
                            <Link className="btn btn-outline-primary me-2" to="/login">Login</Link>
                            <Link className="btn btn-primary" to="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;