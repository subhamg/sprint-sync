"use client";

import Link from "next/link";
import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";

export default function LandingPage() {
  return (
    <Container size="md" mt={80}>
      <Stack gap="md" align="center">
        <Title order={1} ta="center">
          SprintSync
        </Title>
        <Text c="dimmed" ta="center" maw={600}>
          Plan faster. Focus deeper. Track time effortlessly. SprintSync helps you
          organize tasks and get an AI-powered daily plan.
        </Text>
        <Group mt="md">
          <Button component={Link} href="/login" size="md">
            Log in
          </Button>
          <Button component={Link} href="/signup" variant="light" size="md">
            Sign up
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>SprintSync</h1>
      <p>Web app scaffold is live.</p>
    </main>
  );
}
