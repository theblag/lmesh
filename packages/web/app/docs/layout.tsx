import type { Metadata } from "next";
import { DocsLayoutClient } from "../components/DocsLayoutClient";

export const metadata: Metadata = {
  title: "Documentation - LMESH",
  description: "Comprehensive documentation, CLI reference, and security architecture for LMESH.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsLayoutClient>{children}</DocsLayoutClient>;
}
