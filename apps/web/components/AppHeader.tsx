"use client";
import { Button, Group, Paper, Text } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { RootState, clearAuth } from "../lib/store";
import { useRouter } from "next/navigation";
import { authService } from "../services/AuthService";

export default function AppHeader() {
  const { userId, isAdmin, name } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  async function onLogout() {
    try {
      await authService.logout();
    } catch {}
    dispatch(clearAuth());
    router.push("/login");
  }

  if (!userId) return null;

  return (
    <Paper withBorder shadow="xs" px="md" py="sm" component="header">
      <Group justify="space-between">
        <Text fw={600}>SprintSync</Text>
        <Group>
          <Text size="sm" c="dimmed">
            {name} {isAdmin ? "(admin)" : ""}
          </Text>
          <Button variant="light" onClick={onLogout}>
            Logout
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
