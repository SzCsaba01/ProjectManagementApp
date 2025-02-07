import './ProjectCard.css';
import CustomButton from '../button/CustomButton';
import { useNavigate } from 'react-router-dom';
import { setSelectedProject } from '../../services/user.service';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentProjectSuccessAction } from '../../context/project.actions';

const ProjectCard = ({
    projectId,
    projectName,
    hideSetProjectButton = false,
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userId } = useSelector((state) => state.user);

    const handleSetProject = async (event) => {
        event.stopPropagation();
        await setSelectedProject(projectId, userId);
        dispatch(setCurrentProjectSuccessAction(projectId));
    };

    const handleCardClick = () => {
        navigate(`../project-details`, {
            state: {
                projectDetails: {
                    projectName: projectName,
                    projectId: projectId,
                },
            },
        });
    };

    return (
        <div className="project-card" onClick={handleCardClick}>
            <div className="project-card-title">{projectName}</div>
            {!hideSetProjectButton && (
                <div className="project-card-body">
                    <CustomButton type="primary" onClick={handleSetProject}>
                        Set as current project
                    </CustomButton>
                </div>
            )}
        </div>
    );
};

export default ProjectCard;
