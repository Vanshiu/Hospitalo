import React from 'react';
import '../App.css';

const SignupPage = ({ onSignup, onSwitchToLogin }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        onSignup(name, email, password);
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: '#f5f7fa', zIndex: 1000 }}>
            <div className="modal-content" style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
                <h2 className="modal-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-name">Name</label>
                        <input
                            type="text"
                            id="signup-name"
                            name="name"
                            className="form-input"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-email">Email</label>
                        <input
                            type="email"
                            id="signup-email"
                            name="email"
                            className="form-input"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-password">Password</label>
                        <input
                            type="password"
                            id="signup-password"
                            name="password"
                            className="form-input"
                            placeholder="Choose a password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign Up</button>
                </form>
                <div className="modal-footer">
                    Already have an account? <button className="btn-link" onClick={onSwitchToLogin}>Login</button>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
