import React from 'react';
import './Navbar.css';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAction } from '../../../context/user.actions';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../services/auth.service';
import CustomIcon from '../../icon/CustomIcon';
import { NavLink } from 'react-router-dom';
import useRoles from '../../../hooks/useRoles.hook';
import {
    ADMIN_ROLE,
    DEFAULT_PROFILE_IMAGE,
} from '../../../utils/constants.util';
import { clearCurrentProjectDetailsAction } from '../../../context/project.actions';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { firstName, lastName, avatar } = useSelector((state) => state.user);

    const hasAdminRole = useRoles([ADMIN_ROLE]);

    const handleLogout = async () => {
        await logout();
        dispatch(logoutAction());
        dispatch(clearCurrentProjectDetailsAction());
        navigate('/login');
    };

    const handleProfile = () => {
        navigate('profile');
    };

    return (
        <div className="navbar">
            <div className="navbar-brand">
                <CustomIcon
                    name="leaf"
                    size="medium"
                    className="navbar-brand-icon"
                />
                <span className="navbar-brand-text">Project Manager</span>
            </div>
            <div className="navbar-tabs">
                <NavLink
                    to="/home"
                    end
                    className={({ isActive }) =>
                        isActive ? 'navbar-tab active' : 'navbar-tab'
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="projects"
                    className={({ isActive }) =>
                        isActive ? 'navbar-tab active' : 'navbar-tab'
                    }
                >
                    Projects
                </NavLink>
                {hasAdminRole && (
                    <NavLink
                        to="users"
                        className={({ isActive }) =>
                            isActive ? 'navbar-tab active' : 'navbar-tab'
                        }
                    >
                        Users
                    </NavLink>
                )}
            </div>
            <div className="navbar-profile-section">
                <div className="navbar-display-name">
                    {firstName} {lastName}
                </div>
                <div className="navbar-profile">
                    <img
                        src={avatar || DEFAULT_PROFILE_IMAGE}
                        alt="Profile"
                        className="profile-image"
                    />
                    <ul className="navbar-profile-dropdown">
                        <li onClick={handleProfile}>Profile</li>
                        <li onClick={handleLogout}>Logout</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
