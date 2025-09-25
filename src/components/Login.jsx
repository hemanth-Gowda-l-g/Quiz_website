import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { dispatch } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isAdminLogin, setIsAdminLogin] = useState(false);

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message || 'Login failed');
            }

            const decodedUser = jwtDecode(data.token);

            // If admin login is toggled, verify the role from the token
            if (isAdminLogin && decodedUser.user.role !== 'admin') {
                throw new Error("You are not authorized as an admin.");
            }

            dispatch({ type: 'LOGIN', payload: { user: decodedUser.user, token: data.token } });
            
            // Navigate based on user role
            if (decodedUser.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">{isAdminLogin ? 'Admin Sign In' : 'User Sign In'}</h1>
                <p className="auth-subtitle">Sign Into Your Account</p>
                
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="admin-toggle">
                    <span>User</span>
                    <label className="switch">
                        <input type="checkbox" checked={isAdminLogin} onChange={() => setIsAdminLogin(!isAdminLogin)} />
                        <span className="slider round"></span>
                    </label>
                    <span>Admin</span>
                </div>

                <form className="auth-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} minLength="6" required />
                    </div>
                    <input type="submit" className="auth-button" value="Login" />
                </form>
                <p className="auth-redirect">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

