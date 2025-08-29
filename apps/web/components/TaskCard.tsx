"use client";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import StatusChip, { TaskStatus } from "./StatusChip";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store";
import { useEffect, useMemo, useState } from "react";
import {
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconPencil,
  IconTrashFilled,
  IconClockFilled,
  IconTrash,
  IconHourglass,
  IconDots,
  IconCheck,
} from "@tabler/icons-react";

export interface TaskCardProps {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  totalMilliseconds: number;
  startedAt?: string | null;
  isRunning?: boolean;
  onOpenEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, next: TaskStatus) => void;
  onStartTimer?: (id: string) => void;
  onStopTimer?: (id: string) => void;
}

export default function TaskCard({
  id,
  title,
  description,
  status,
  totalMilliseconds,
  startedAt,
  isRunning,
  onOpenEdit,
  onDelete,
  onStatusChange,
  onStartTimer,
  onStopTimer,
}: TaskCardProps) {
  const { isAdmin } = useSelector((s: RootState) => s.auth);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (!isRunning || !startedAt) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [isRunning, startedAt]);

  function start() {
    if (!onStartTimer) return;
    onStartTimer(id);
  }

  function stop() {
    if (!onStopTimer) return;
    onStopTimer(id);
  }

  const { totalCompact } = useMemo(() => {
    const baseSeconds = Math.max(0, totalMilliseconds) / 1000;
    let runningSeconds = 0;

    if (isRunning && startedAt) {
      const ms = now - new Date(startedAt).getTime();
      runningSeconds = Math.max(0, Math.floor(ms / 1000));
    }

    const totalSeconds = baseSeconds + runningSeconds;

    const fmtCompact = (secs: number) => {
      if (secs <= 0) return "0 sec";

      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = Math.floor(secs % 60);

      const parts: string[] = [];
      if (h > 0) parts.push(`${h} h`);
      if (m > 0) parts.push(`${m} min${m !== 1 ? "s" : ""}`);
      if (s >= 0) parts.push(`${s} sec${s !== 1 ? "s" : ""}`);

      return parts.join(" ");
    };

    return {
      totalCompact: fmtCompact(totalSeconds),
    };
  }, [now, isRunning, startedAt, totalMilliseconds]);

  function deleteTask() {
    if (!isAdmin) {
      notifications.show({
        color: "yellow",
        message: "Only admins can delete tasks.",
      });
      return;
    }
    onDelete(id);
  }

  return (
    <Card withBorder shadow="xs" radius="md" p="md">
      <Stack gap={6} style={{ alignItems: "stretch" }}>
        <Group justify="space-between" align="center">
          <Text fw={700} tt="capitalize">
            {title}
          </Text>
          <Group gap="4px">
            <ActionIcon
              onClick={() => onOpenEdit(id)}
              variant="subtle"
              color="gray"
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon color="red" variant="subtle" onClick={deleteTask}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>
        {description && (
          <Text size="sm" c="dimmed" tt="capitalize">
            {description}
          </Text>
        )}
        <Group justify="space-between" mt="xs" align="center">
          <Group gap="4px">
            <IconClockFilled size={16} color="gray" />
            <Text size="sm">{totalCompact} logged</Text>
          </Group>
          <Group gap="xs">
            {!isRunning ? (
              <Button
                onClick={start}
                variant="light"
                size="xs"
                leftSection={<IconPlayerPlayFilled size={16} />}
              >
                Log Time
              </Button>
            ) : (
              <Button
                onClick={stop}
                variant="light"
                color="red"
                size="xs"
                leftSection={<IconPlayerStopFilled size={16} />}
              >
                Stop Logging
              </Button>
            )}
            <StatusChip
              status={status}
              onChange={(next) => onStatusChange(id, next)}
              isAdmin={isAdmin}
            />
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
