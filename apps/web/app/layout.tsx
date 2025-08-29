import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { ReactNode } from "react";
import Providers from "./providers";
import { Notifications } from "@mantine/notifications";
import "@mantine/charts/styles.css";

export const metadata = {
  title: "SprintSync",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <Notifications position="top-right" zIndex={9999} />
          <Providers>{children}</Providers>
        </MantineProvider>
      </body>
    </html>
  );
}
