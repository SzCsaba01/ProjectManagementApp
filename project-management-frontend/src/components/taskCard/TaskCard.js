import './TaskCard.css';
import { TaskCategory, TaskPriority } from '../../utils/enums.util';
import CustomIcon from '../icon/CustomIcon';
import { DEFAULT_PROFILE_IMAGE } from '../../utils/constants.util';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TaskCard = ({ task, handleTaskClick = () => {}, isDragging = false }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : undefined,
        backgroundColor: isDragging ? 'white' : '',
        height: isDragging ? '2rem' : '20%',
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style}
            className="task-container"
            onClick={() => handleTaskClick(task)}
        >
            <div className="task-type">
                <CustomIcon
                    name={TaskCategory[task.category].icon}
                    size="small"
                />
                <CustomIcon
                    name={TaskPriority[task.priority].icon}
                    size="small"
                />
            </div>
            <div className="task-details">
                <img
                    src={task.assignee?.avatar || DEFAULT_PROFILE_IMAGE}
                    alt="Profile"
                />
                <span>{task.name}</span>
            </div>
        </div>
    );
};

export default TaskCard;
