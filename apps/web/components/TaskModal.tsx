"use client";
import { Button, Modal, Stack, TextInput, Textarea } from "@mantine/core";
import { useEffect, useState } from "react";

export interface TaskFormValues {
  title: string;
  description: string | null;
}

export default function TaskModal({
  opened,
  onClose,
  initial,
  onSubmit,
}: {
  opened: boolean;
  onClose: () => void;
  initial?: TaskFormValues | null;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
  }, [initial]);

  async function handleSubmit() {
    setLoading(true);
    try {
      await onSubmit({ title, description: description || null });
      setTitle("");
      setDescription("");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initial ? "Edit Task" : "New Task"}
    >
      <Stack>
        <TextInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={3}
        />
        <Button onClick={handleSubmit} loading={loading} disabled={!title}>
          {initial ? "Save" : "Create"}
        </Button>
      </Stack>
    </Modal>
  );
}
