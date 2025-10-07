"use client";
import { Task } from "@/app/entities/task/types";
import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ReactNode } from "react";
import SortableItem from "./SortableItem";


export interface DroppableColumnProps {
  id: string;

  title?: string;

  tasks?: Task[];

  items?: UniqueIdentifier[];

  children?: ReactNode;

  className?: string;
}


export const DroppableColumn = ({
  id,
  title,
  tasks,
  items,
  children,
  className = "",
}: DroppableColumnProps) => {
  const hasList = Array.isArray(tasks) && Array.isArray(items);

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "column" }
  })


  return (
    <div
      data-column-id={id}
      ref={setNodeRef}
      className={`bg-[#2a2a2a] p-4 rounded min-w-[270px] flex-1 ${className} ${isOver ? "bg-gray-200 text-gray-600" : ""}  ${id === "Por hacer" ? "bg-gray-600/10" : id === "En progreso" ? "bg-yellow-400/10" : "bg-green-600/10"}`}
    >
      {children ? (
        <div className="mb-3">{children}</div>
      ) : title ? (
        <h2 className="font-bold mb-3 text-center text-gray-700">{title}</h2>
      ) : null}

      {hasList && (
        <SortableContext id={id} items={items!} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks!.map((task) => (
              <SortableItem key={task._id} id={task._id} task={task} />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
};

export default DroppableColumn;
