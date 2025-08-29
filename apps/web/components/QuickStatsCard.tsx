"use client";
import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCircleCheck, IconCircle, IconProgress } from "@tabler/icons-react";

export default function QuickStatsCard({
  todo,
  inProgress,
  done,
}: {
  todo: number;
  inProgress: number;
  done: number;
}) {
  return (
    <Card withBorder shadow="xs" p="md" radius="md">
      <Text fw={700} mb="sm">
        Quick Stats
      </Text>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color="gray" variant="light">
              <IconCircle size={16} />
            </ThemeIcon>
            <Text>To Do</Text>
          </Group>
          <Text fw={700}>{todo}</Text>
        </Group>
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light">
              <IconProgress size={16} />
            </ThemeIcon>
            <Text>In Progress</Text>
          </Group>
          <Text fw={700}>{inProgress}</Text>
        </Group>
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color="green" variant="light">
              <IconCircleCheck size={16} />
            </ThemeIcon>
            <Text>Done</Text>
          </Group>
          <Text fw={700}>{done}</Text>
        </Group>
      </Stack>
    </Card>
  );
}
