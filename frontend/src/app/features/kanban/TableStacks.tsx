"use client";

import { ColumnData, Task } from "@/app/entities/task/types";
import { useGetTasks } from "@/app/features/kanban/hooks/useTasks";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

import Form from "@/shared/Form";
import { getSocket } from "@/shared/lib/socket";
import { Spinner } from "@/shared/ui/spinner";
import DroppableColumn from "./DroppableColumn";
import ExportForm from "./ExportForm";
import SortableItem from "./SortableItem";

const COLUMN_KEYS = ["Por hacer", "En progreso", "Completado"] as const;

const emptyColumns = (): ColumnData =>
  COLUMN_KEYS.reduce((acc, k) => {
    acc[k] = [];
    return acc;
  }, {} as ColumnData);

type Props = { isLoading?: boolean };

function normalizeTasks(payload: any): Task[] {
  const arr =
    (Array.isArray(payload?.data) && payload.data) ||
    (Array.isArray(payload?.tasks) && payload.tasks) ||
    (Array.isArray(payload?.items) && payload.items) ||
    (Array.isArray(payload) && payload) ||
    [];
  return arr as Task[];
}

function safeColumnId(id: string | undefined): typeof COLUMN_KEYS[number] {
  if (id && COLUMN_KEYS.includes(id as any)) return id as any;
  return "Por hacer";
}

const TableStacks = ({ isLoading: forceLoading }: Props) => {
  const { data, mutate } = useGetTasks();

  const [columns, setColumns] = useState<ColumnData>(emptyColumns());
  const [activeId, setActiveId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const didBootstrapRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );


  useEffect(() => {
    if (!didBootstrapRef.current) {
      didBootstrapRef.current = true;
      mutate?.();
    }
  }, [mutate]);

  // Normalizar datos HTTP
  useEffect(() => {
    const tasks = normalizeTasks(data);
    const grouped: ColumnData = emptyColumns();

    tasks.forEach((t) => {
      const col = safeColumnId((t as any).columnId);
      grouped[col].push(t);
    });

    (Object.keys(grouped) as (keyof ColumnData)[]).forEach((col) => {
      grouped[col].sort((a, b) => {
        const pa = a.position ?? Number.MAX_SAFE_INTEGER;
        const pb = b.position ?? Number.MAX_SAFE_INTEGER;
        if (pa !== pb) return pa - pb;
        const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ca - cb;
      });
    });

    setColumns(grouped);
  }, [data]);

  // Conexión y listeners RT (un solo socket compartido)
  useEffect(() => {
    const s = getSocket();
    socketRef.current = s;

    const onCreated = (createdTask: Task) => {
      setColumns((prev) => {
        const copy = { ...prev };
        const col = safeColumnId((createdTask as any).columnId);
        const arr = [...(copy[col] ?? [])];
        if (typeof createdTask.position === "number") {
          const idx = Math.max(0, Math.min(arr.length, createdTask.position));
          arr.splice(idx, 0, createdTask);
        } else {
          arr.push(createdTask);
        }
        copy[col] = arr;
        return copy;
      });
    };

    const onUpdated = (updatedTask: Task) => {
      setColumns((prev) => {
        const copy: ColumnData = Object.fromEntries(
          Object.entries(prev).map(([k, arr]) => [k, arr.filter((t) => t._id !== updatedTask._id)])
        ) as ColumnData;

        const col = safeColumnId((updatedTask as any).columnId);
        const arr = [...(copy[col] ?? [])];
        if (typeof updatedTask.position === "number") {
          const idx = Math.max(0, Math.min(arr.length, updatedTask.position));
          arr.splice(idx, 0, updatedTask);
        } else {
          arr.push(updatedTask);
        }
        copy[col] = arr;
        return copy;
      });
    };

    const onDeleted = ({ taskId }: { taskId: string }) => {
      setColumns((prev) => {
        const copy = Object.fromEntries(
          Object.entries(prev).map(([k, arr]) => [k, arr.filter((t) => t._id !== taskId)])
        ) as ColumnData;
        return copy;
      });
    };

    const onColumnReordered = ({ columnId, tasks }: { columnId: string; tasks: Task[] }) => {
      const col = safeColumnId(columnId);
      setColumns((prev) => ({ ...prev, [col]: tasks }));
    };

    s.on("connect", () => mutate?.());
    s.on("taskCreated", onCreated);
    s.on("taskUpdated", onUpdated);
    s.on("taskDeleted", onDeleted);
    s.on("columnReordered", onColumnReordered);

    return () => {
      s.off("taskCreated", onCreated);
      s.off("taskUpdated", onUpdated);
      s.off("taskDeleted", onDeleted);
      s.off("columnReordered", onColumnReordered);
      socketRef.current = null;
    };
  }, [mutate]);

  // ========= DnD =========
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const s = socketRef.current;
    const draggedId = String(active.id);
    const overId = String(over.id);

    const sourceColumnId = Object.keys(columns).find((col) =>
      columns[col].some((t) => t._id === draggedId)
    );
    if (!sourceColumnId) return;

    const isOverColumn = over.data?.current?.type === "column";
    const targetColumnId = isOverColumn
      ? (overId as string)
      : Object.keys(columns).find((col) => columns[col].some((t) => t._id === overId));

    if (!targetColumnId) return;

    // Reordenar dentro de la misma columna
    if (sourceColumnId === targetColumnId) {
      const tasks = [...columns[sourceColumnId]];
      const oldIndex = tasks.findIndex((t) => t._id === draggedId);
      const newIndex = isOverColumn
        ? tasks.length - 1
        : tasks.findIndex((t) => t._id === overId);

      if (oldIndex < 0 || newIndex < 0) return;

      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setColumns((prev) => ({ ...prev, [sourceColumnId]: newTasks }));

      const payload = newTasks.map((t, idx) => ({ taskId: t._id, position: idx }));
      s?.emit("reorderColumn", { columnId: sourceColumnId, items: payload });
      return;
    }

    // Mover ENTRE columnas
    const activeTask = columns[sourceColumnId].find((t) => t._id === draggedId);
    if (!activeTask) return;

    const targetArr = [...(columns[targetColumnId] ?? [])];
    const idxOver = isOverColumn ? targetArr.length : targetArr.findIndex((t) => t._id === overId);
    const targetIndex = idxOver === -1 ? targetArr.length : idxOver;

    const newSource = columns[sourceColumnId].filter((t) => t._id !== draggedId);
    const moved: Task = { ...activeTask, columnId: targetColumnId as any, position: targetIndex };
    const newTarget = [...targetArr];
    newTarget.splice(targetIndex, 0, moved);

    setColumns((prev) => ({
      ...prev,
      [sourceColumnId]: newSource,
      [targetColumnId]: newTarget,
    }));

    s?.emit("updateTask", {
      taskId: draggedId,
      updatedData: { columnId: targetColumnId, position: targetIndex },
    });

    const sourcePayload = newSource.map((t, idx) => ({ taskId: t._id, position: idx }));
    const targetPayload = newTarget.map((t, idx) => ({ taskId: t._id, position: idx }));
    s?.emit("reorderColumn", { columnId: sourceColumnId, items: sourcePayload });
    s?.emit("reorderColumn", { columnId: targetColumnId, items: targetPayload });
  }

  const activeTask: Task | undefined = useMemo(() => {
    if (!activeId) return undefined;
    const key = Object.keys(columns).find((col) =>
      columns[col].some((t) => t._id === activeId)
    );
    return key ? columns[key].find((t) => t._id === activeId) : undefined;
  }, [activeId, columns]);

  const loading = Boolean(forceLoading);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-wrap justify-center gap-4 text-white">
        {Object.keys(columns).map((colKey) => {
          const colTasks = columns[colKey] ?? [];
          const items: UniqueIdentifier[] = colTasks.map((t) => t._id || "");

          return (
            <DroppableColumn key={colKey} id={colKey}>
              <h2 className="font-bold mb-2 flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${colKey === "Por hacer"
                    ? "bg-gray-600"
                    : colKey === "En progreso"
                      ? "bg-yellow-400"
                      : "bg-green-600"
                    }`}
                />
                <span className="ml-2">
                  {colKey} ({colTasks.length})
                </span>
              </h2>

              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {loading ? (
                    <Spinner />
                  ) : (
                    colTasks.map((task) => {
                      console.log(task)
                      return (
                        <div key={task._id}>
                          <SortableItem handle key={task._id} id={task._id} task={task} />
                        </div>
                      )
                    })
                  )}
                </div>
              </SortableContext>

              {colKey === "Por hacer" && (
                <div className="mt-2">
                  <Form />
                </div>
              )}
            </DroppableColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeId && activeTask ? (
          <div style={{ width: 240 }}>
            <SortableItem id={activeTask._id} task={activeTask} handle={true} />
          </div>
        ) : null}
      </DragOverlay>

      <ExportForm columns={columns} />
    </DndContext>
  );
};

export default TableStacks;
