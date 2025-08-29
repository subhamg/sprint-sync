"use client";
import { Button, Paper, TextInput, Title } from "@mantine/core";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../../services/AuthService";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.register(email, name, password);
      await authService.login(email, password);
      router.push("/tasks");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <Paper p="lg" withBorder style={{ width: 360 }}>
        <form onSubmit={onSubmit}>
          <Title order={3} mb="md">
            Sign up
          </Title>
          <TextInput
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            mb="sm"
            required
          />
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            mb="sm"
            required
          />
          <TextInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            mb="md"
            required
          />
          {error && (
            <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>
          )}
          <Button type="submit" fullWidth loading={loading}>
            Create account
          </Button>
        </form>
      </Paper>
    </main>
  );
}
