"use client";

import { useMemo } from "react";
import { Card, Group, Stack, Text, Title } from "@mantine/core";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
};

export function KanbanBoard(props: {
  tasks: Task[];
  onMove: (id: string, next: Task["status"]) => void;
}) {
  const todo = props.tasks.filter((t) => t.status === "TODO");
  const inProgress = props.tasks.filter((t) => t.status === "IN_PROGRESS");
  const done = props.tasks.filter((t) => t.status === "DONE");

  function handleDragEnd(e: DragEndEvent) {
    const id = String(e.active.id);
    const overCol = (e.over?.id as string) || "";
    if (!overCol) return;
    const next = (overCol as any) as Task["status"]; // column id matches status
    props.onMove(id, next);
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Group align="flex-start" grow>
        <KanbanColumn id="TODO" title="Todo" items={todo} />
        <KanbanColumn id="IN_PROGRESS" title="In Progress" items={inProgress} />
        <KanbanColumn id="DONE" title="Done" items={done} />
      </Group>
    </DndContext>
  );
}

function KanbanColumn(props: { id: string; title: string; items: Task[] }) {
  return (
    <Stack miw={280}>
      <Title order={4}>{props.title}</Title>
      <SortableContext items={props.items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
        <Stack>
          {props.items.map((t) => (
            <Card key={t.id} withBorder>
              <Text fw={600}>{t.title}</Text>
              {t.description && (
                <Text size="sm" c="dimmed" lineClamp={2} mt={4}>
                  {t.description}
                </Text>
              )}
            </Card>
          ))}
        </Stack>
      </SortableContext>
    </Stack>
  );
}


