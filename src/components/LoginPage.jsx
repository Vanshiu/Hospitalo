import React from 'react';
import '../App.css';

const LoginPage = ({ onLogin, onSwitchToSignup }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        onLogin(email, password);
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: '#f5f7fa', zIndex: 1000 }}>
            <div className="modal-content" style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
                <h2 className="modal-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Login to Hospital Locator</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">Email</label>
                        <input
                            type="email"
                            id="login-email"
                            name="email"
                            className="form-input"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-password">Password</label>
                        <input
                            type="password"
                            id="login-password"
                            name="password"
                            className="form-input"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
                </form>
                <div className="modal-footer">
                    Don't have an account? <button className="btn-link" onClick={onSwitchToSignup}>Sign up</button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
