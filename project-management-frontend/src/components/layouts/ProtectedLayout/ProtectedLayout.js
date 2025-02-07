import React from 'react';
import Sidebar from '../../common/Sidebar/Sidebar';
import Navbar from '../../common/Navbar/Navbar';
import './ProtectedLayout.css';

const ProtectedLayout = ({ children }) => {
    return (
        <div className="protected-layout">
            <Navbar />
            <div className="protected-layout-container">
                <Sidebar />
                <div className="protected-layout-content">{children}</div>
            </div>
        </div>
    );
};

export default ProtectedLayout;
