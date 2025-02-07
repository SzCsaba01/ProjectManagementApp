import React from 'react';
import './PublicLayout.css';

const PublicLayout = ({ children }) => {
    return (
        <div className="public-layout">
            <header className="public-header">
                <h1 className="public-title">Project Management App</h1>
            </header>
            <main className="public-main">{children}</main>
            <footer className="public-footer">
                <p>
                    &copy; {new Date().getFullYear()} Project Management App.
                    All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default PublicLayout;
