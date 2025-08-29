"use client";
import { Badge, Button, Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCaretDownFilled,
  IconCheck,
  IconChevronDown,
  IconDots,
} from "@tabler/icons-react";
import { useState } from "react";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

function colorFor(status: TaskStatus) {
  if (status === "TODO") return "gray" as const;
  if (status === "IN_PROGRESS") return "blue" as const;
  return "green" as const;
}

function nextStatus(status: TaskStatus): TaskStatus {
  if (status === "TODO") return "IN_PROGRESS";
  if (status === "IN_PROGRESS") return "DONE";
  return "DONE";
}

export default function StatusChip({
  status,
  onChange,
  isAdmin,
}: {
  status: TaskStatus;
  onChange: (next: TaskStatus) => void;
  isAdmin: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  function handleChange(next: TaskStatus) {
    setIsOpen(false);
    onChange(next);
  }

  return (
    <Menu opened={isOpen} onClose={() => setIsOpen(false)}>
      <Menu.Target>
        <Button
          variant="filled"
          color={colorFor(status)}
          size="xs"
          tt="capitalize"
          onClick={() => handleChange(nextStatus(status))}
          rightSection={<IconCaretDownFilled size={16} />}
        >
          {status.replace("_", " ").toLowerCase()}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={() => onChange("TODO")}>Todo</Menu.Item>
        <Menu.Item onClick={() => onChange("IN_PROGRESS")}>
          In Progress
        </Menu.Item>
        <Menu.Item onClick={() => onChange("DONE")}>Done</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
