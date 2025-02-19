import './UserDetails.css';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ADMIN_ROLE,
    DEFAULT_PROFILE_IMAGE,
    MANAGER_ROLE,
} from '../../../utils/constants.util';
import useRoles from '../../../hooks/useRoles.hook';
import {
    getProjectsByMemberId,
    getProjectsByOwnerId,
} from '../../../services/project.service';
import ProjectCard from '../../../components/projectCard/ProjectCard';
import CustomIcon from '../../../components/icon/CustomIcon';
import ConfirmationPopup from '../../../components/confirmationPopup/ConfirmationPopup';
import { deleteUser } from '../../../services/user.service';

const UserDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = location.state || {};
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [projects, setProjects] = useState([]);
    const isAdmin = useRoles([ADMIN_ROLE]);

    useEffect(() => {
        if (!user || !isAdmin) {
            navigate('../projects');
            return;
        }

        const fetchUserProjects = async () => {
            let userProjects = [];
            if (user.roles.some((role) => role === MANAGER_ROLE)) {
                userProjects = await getProjectsByOwnerId(user.userId);
            } else {
                userProjects = await getProjectsByMemberId(user.userId);
            }
            setProjects(userProjects);
        };

        fetchUserProjects();
    }, [user, isAdmin, navigate]);

    const handleChangeShowConfirmation = () => {
        setShowConfirmation(!showConfirmation);
    };

    const handleDeleteUser = async () => {
        await deleteUser(user.userId);
        navigate('/home');
    };

    if (!user) return null;

    return (
        <>
            <div className="user-details-container">
                <h1>User Details</h1>
                <div className="user-info">
                    <img
                        src={user.avatar || DEFAULT_PROFILE_IMAGE}
                        alt={user.username}
                        className="user-avatar"
                    />
                    <div className="user-meta">
                        <div className="user-display-name-container">
                            <h2>
                                {user.firstName} {user.lastName}
                            </h2>
                            <CustomIcon
                                name="trash"
                                size="medium"
                                className="delete-icon"
                                onClick={handleChangeShowConfirmation}
                            />
                        </div>
                        <p>Username: {user.username}</p>
                        <p>Email: {user.email}</p>
                        <p>Role(s): {user.roles.join(', ')}</p>
                    </div>
                </div>
                <div className="user-projects">
                    <h2>Projects</h2>
                    {projects?.length > 0 ? (
                        <div className="projects-grid">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project._id}
                                    projectId={project._id}
                                    projectName={project.name}
                                    hideSetProjectButton={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <p>No projects found for this user.</p>
                    )}
                </div>
            </div>
            {showConfirmation && (
                <ConfirmationPopup
                    message="Are you sure you want to delete the user?"
                    onCancel={handleChangeShowConfirmation}
                    onConfirm={handleDeleteUser}
                />
            )}
        </>
    );
};

export default UserDetails;
