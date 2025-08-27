"use client";
import { Button, Group, NumberInput, Table, Text } from "@mantine/core";
import { useState } from "react";
import StatusChip, { TaskStatus } from "./StatusChip";

export interface TaskProps {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  totalMinutes: number;
}

export default function TaskRow({
  task,
  onStatusChange,
  onLogTime,
}: {
  task: TaskProps;
  onStatusChange: (id: string, next: TaskStatus) => void;
  onLogTime: (id: string, minutes: number) => void;
}) {
  const [minutes, setMinutes] = useState<number | "">("");
  return (
    <Table.Tr>
      <Table.Td>
        <Text fw={600}>{task.title}</Text>
        {task.description && (
          <Text size="sm" c="dimmed">
            {task.description}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <StatusChip
          status={task.status}
          onChange={(next) => onStatusChange(task.id, next)}
        />
      </Table.Td>
      <Table.Td>{task.totalMinutes} min</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <NumberInput
            min={1}
            value={minutes}
            onChange={(val) => setMinutes(typeof val === "number" ? val : "")}
            placeholder="min"
            style={{ width: 90 }}
          />
          <Button
            size="xs"
            onClick={() =>
              typeof minutes === "number" &&
              minutes > 0 &&
              (onLogTime(task.id, minutes), setMinutes(""))
            }
          >
            Log
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
