import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from '../taskCard/TaskCard';
import './DropContainer.css';

const DropContainer = ({
    containerName,
    handleTaskClick,
    tasks,
    isDragging = false,
}) => {
    const { setNodeRef } = useDroppable({
        id: containerName,
    });

    return (
        <SortableContext
            id={containerName}
            strategy={verticalListSortingStrategy}
            items={tasks.map((task) => task._id)}
        >
            <div ref={setNodeRef} className="drop-container">
                {tasks.map((task) => (
                    <TaskCard
                        handleTaskClick={handleTaskClick}
                        isDragging={isDragging}
                        key={task._id}
                        id={task._id}
                        task={task}
                        containerName={containerName}
                    />
                ))}
            </div>
        </SortableContext>
    );
};

export default DropContainer;
