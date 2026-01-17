import React from 'react';
import './../App.css';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
