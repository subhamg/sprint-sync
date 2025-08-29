"use client";
import {
  Alert,
  Button,
  Card,
  Drawer,
  List,
  Group,
  Stack,
  Text,
  Title,
  Skeleton,
} from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { aiService } from "../services/AiService";
import { useState } from "react";
import { IconRobotFace } from "@tabler/icons-react";

export default function AiAssistantCard() {
  const [opened, setOpened] = useState(false);
  const mutate = useMutation({ mutationFn: () => aiService.suggest() });

  function open() {
    setOpened(true);
    mutate.mutate();
  }

  return (
    <>
      <Card withBorder shadow="xs" p="md" radius="md">
        <Stack gap="xs">
          <Group gap="xs">
            <IconRobotFace size={16} color="#9333ea" />
            <Title order={5}>AI Assistant</Title>
          </Group>

          <Alert
            color="#6b21a8"
            radius="md"
            variant="light"
            bd={`1px solid rgb(235, 213, 255)`}
          >
            <Text size="sm" c="#9333ea">
              Get a suggested daily plan based on your current tasks.
            </Text>
          </Alert>

          <Button onClick={open} loading={mutate.isPending} color="#9333ea">
            Get New Suggestions
          </Button>
          {mutate.isError && (
            <Text c="red">{(mutate.error as Error)?.message || "Failed"}</Text>
          )}
        </Stack>
      </Card>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        position="right"
        size="md"
        title="Daily Plan"
      >
        {mutate.isPending && (
          <Stack gap="md">
            <Skeleton height={20} radius="md" />
            <Skeleton height={20} radius="md" />
            <Stack gap="xs" w="100%">
              <Skeleton height={20} radius="md" w="100%" />
              <Skeleton height={20} radius="md" w="100%" />
            </Stack>
          </Stack>
        )}
        {mutate.isError && (
          <Text c="red">
            {(mutate.error as Error)?.message || "Failed to load plan"}
          </Text>
        )}
        {mutate.isSuccess && (
          <Stack>
            <Text>{mutate.data.summary}</Text>
            <div>
              <Title order={5}>Top priorities</Title>
              <List>
                {mutate.data.priorities.map((p) => (
                  <List.Item key={p.taskId}>
                    <b>{p.title}</b> – {p.reason}
                  </List.Item>
                ))}
              </List>
            </div>
            <div>
              <Title order={5}>Blocks</Title>
              <List>
                {mutate.data.blocks.map((b, i) => (
                  <List.Item key={i}>
                    <b>{b.label}</b>: {b.focus}
                  </List.Item>
                ))}
              </List>
            </div>
          </Stack>
        )}
      </Drawer>
    </>
  );
}
