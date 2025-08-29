"use client";

import { Card, Group, Stack, Title } from "@mantine/core";
import {
  DndContext,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import StatusChip, { TaskStatus } from "./StatusChip";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  totalMilliseconds: number;
  startedAt?: string | null;
  isRunning?: boolean;
  ownerName?: string | null;
};

export function KanbanBoard(props: {
  tasks: Task[];
  onMove: (id: string, next: Task["status"]) => void;
  onOpenEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, next: Task["status"]) => void;
  onStartTimer: (id: string) => void;
  onStopTimer: (id: string) => void;
}) {
  const todo = props.tasks.filter((t) => t.status === "TODO");
  const inProgress = props.tasks.filter((t) => t.status === "IN_PROGRESS");
  const done = props.tasks.filter((t) => t.status === "DONE");

  function handleDragEnd(e: DragEndEvent) {
    const id = String(e.active.id);
    const overCol = (e.over?.id as string) || "";
    if (!overCol) return;
    const next = overCol as any as Task["status"]; // column id matches status
    props.onMove(id, next);
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Group align="flex-start" grow>
        <KanbanColumn id="TODO" title="Todo" items={todo} {...props} />
        <KanbanColumn
          id="IN_PROGRESS"
          title="In Progress"
          items={inProgress}
          {...props}
        />
        <KanbanColumn id="DONE" title="Done" items={done} {...props} />
      </Group>
    </DndContext>
  );
}

function KanbanColumn(props: {
  id: string;
  title: string;
  items: Task[];
  onOpenEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, next: Task["status"]) => void;
  onStartTimer: (id: string) => void;
  onStopTimer: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: props.id });
  return (
    <Stack
      miw={280}
      ref={setNodeRef}
      p="xs"
      style={{
        background: isOver ? "#f1f3f5" : "transparent",
        borderRadius: 8,
        minHeight: "80vh",
      }}
    >
      <Title order={4}>{props.title}</Title>
      <Stack>
        {props.items.map((t) => (
          <DraggableTask
            key={t.id}
            task={t}
            onOpenEdit={props.onOpenEdit}
            onDelete={props.onDelete}
            onStatusChange={props.onStatusChange}
            onStartTimer={props.onStartTimer}
            onStopTimer={props.onStopTimer}
          />
        ))}
      </Stack>
    </Stack>
  );
}

function DraggableTask(props: {
  task: Task;
  onOpenEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, next: Task["status"]) => void;
  onStartTimer: (id: string) => void;
  onStopTimer: (id: string) => void;
}) {
  const { task } = props;
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });
  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.6 : 1,
    cursor: "grab",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        id={task.id}
        title={task.title}
        description={task.description}
        status={task.status}
        totalMilliseconds={task.totalMilliseconds}
        startedAt={task.startedAt || undefined}
        isRunning={!!task.isRunning}
        onOpenEdit={props.onOpenEdit}
        onDelete={props.onDelete}
        onStatusChange={props.onStatusChange}
        onStartTimer={props.onStartTimer}
        onStopTimer={props.onStopTimer}
        ownerName={task.ownerName}
      />
    </div>
  );
}
