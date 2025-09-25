import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import './Auth.css';

// This is the secret key for admin registration.
const ADMIN_COMPANY_KEY = 'SUPER_SECRET_KEY_123';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        age: '',
        gender: 'male',
        password: '',
        password2: '',
        companyKey: ''
    });
    const { dispatch } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const { username, name, email, age, gender, password, password2, companyKey } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError(null);
        if (password !== password2) {
            return setError('Passwords do not match');
        }

        let role = 'user'; // Default role is user

        // Check for the admin company key
        if (companyKey) {
            if (companyKey === ADMIN_COMPANY_KEY) {
                role = 'admin';
            } else {
                return setError('Invalid Company Key for Admin registration.');
            }
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, name, email, age, gender, password, role })
            });

            const data = await res.json();
             if (!data.success) {
                throw new Error(data.message || 'Registration failed');
            }
            
            const decodedUser = jwtDecode(data.token);
            dispatch({ type: 'LOGIN', payload: { user: decodedUser.user, token: data.token } });
            
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
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Get started with your new account</p>
                {error && <div className="alert alert-danger">{error}</div>}
                <form className="auth-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <input type="text" placeholder="Username" name="username" value={username} onChange={onChange} required />
                    </div>
                     <div className="form-group">
                        <input type="text" placeholder="Full Name" name="name" value={name} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
                    </div>
                    <div className="row gx-2">
                        <div className="col">
                            <div className="form-group">
                                <input type="number" placeholder="Age" name="age" value={age} onChange={onChange} required />
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-group">
                                <select name="gender" value={gender} onChange={onChange} className="form-control" style={{padding: '1rem'}}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Password (min. 6 characters)" name="password" value={password} onChange={onChange} minLength="6" required />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Confirm Password" name="password2" value={password2} onChange={onChange} minLength="6" required />
                    </div>
                    <div className="form-group">
                        <input type="text" placeholder="Company Key (Optional, for Admins)" name="companyKey" value={companyKey} onChange={onChange} />
                    </div>
                    <input type="submit" className="auth-button" value="Register" />
                </form>
                <p className="auth-redirect">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

