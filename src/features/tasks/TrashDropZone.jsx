import { Droppable } from "@hello-pangea/dnd";

export default function TrashDropZone() {
  return (
    <Droppable droppableId="trash">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`trash-zone ${snapshot.isDraggingOver ? "armed" : ""}`}
          aria-label="Drop a task here to delete it"
        >
          🗑
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}