"use client";
import {
  Button,
  Drawer,
  List,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { aiService } from "../services/AiService";

export default function AiDrawer() {
  const [opened, setOpened] = useState(false);
  const mutate = useMutation({ mutationFn: () => aiService.suggest() });

  function open() {
    setOpened(true);
    mutate.mutate();
  }

  return (
    <>
      <Button onClick={open}>AI Assist</Button>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        position="right"
        size="md"
        title="Daily Plan"
      >
        {mutate.isPending && <Loader />}
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
