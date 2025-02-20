import './ProjectDetails.css';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUsersByProject } from '../../../services/user.service';
import {
    ADMIN_ROLE,
    DEFAULT_PROFILE_IMAGE,
} from '../../../utils/constants.util';
import useRoles from '../../../hooks/useRoles.hook';
import CustomIcon from '../../../components/icon/CustomIcon';
import ConfirmationPopup from '../../../components/confirmationPopup/ConfirmationPopup';
import { deleteProject } from '../../../services/project.service';

const ProjectDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const projectDetails = location.state?.projectDetails || {};

    const [users, setUsers] = useState(null);
    const [owner, setOwner] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const isAdmin = useRoles([ADMIN_ROLE]);

    useEffect(() => {
        const fetchUsers = async (projectId) => {
            const data = await getUsersByProject(projectId);

            setUsers(data.users);
            setOwner(data.owner);
        };
        fetchUsers(projectDetails?.projectId);
    }, [navigate, projectDetails.projectId]);

    const handleUserClick = (user) => {
        navigate('../user-details', { state: { user } });
    };

    const handleEdit = () => {
        navigate('../edit-project', {
            state: { projectDetails, owner, users },
        });
    };

    const handleDelete = async () => {
        await deleteProject(projectDetails.projectId);
        setShowConfirmation(false);
    };

    const handleCancelDelete = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="project-details-container">
            <h1>Project Details</h1>

            <div className="project-details">
                <div className="project-details-header">
                    <h2>{projectDetails?.projectName}</h2>
                    {isAdmin && (
                        <div className="project-actions">
                            <CustomIcon
                                name="edit"
                                title="Edit Project"
                                className="edit-icon"
                                onClick={handleEdit}
                            />
                            <CustomIcon
                                name="trash"
                                title="Delete Project"
                                className="delete-icon"
                                onClick={() => setShowConfirmation(true)}
                            />
                        </div>
                    )}
                </div>
                <div className="project-info">
                    <div
                        className={`owner-info ${isAdmin ? 'clickable' : ''}`}
                        onClick={() => isAdmin && handleUserClick(owner)}
                    >
                        <img
                            src={owner?.avatar || DEFAULT_PROFILE_IMAGE}
                            alt={owner?.username}
                        />
                        <p>
                            Owner: {owner?.firstName} {owner?.lastName}
                        </p>
                    </div>
                </div>
                <div className="team-members">
                    <h3>Team Members</h3>
                    <ul>
                        {users?.map((user) => (
                            <li
                                key={user.username}
                                onClick={() => isAdmin && handleUserClick(user)}
                                className={isAdmin ? 'clickable' : ''}
                            >
                                <img
                                    src={user.avatar || DEFAULT_PROFILE_IMAGE}
                                    alt={user.username}
                                />
                                {user.firstName} {user.lastName} (
                                {user.roles.join(', ')})
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {showConfirmation && (
                <ConfirmationPopup
                    message="Are you sure you want to delete this project?"
                    onCancel={handleCancelDelete}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
};

export default ProjectDetails;
