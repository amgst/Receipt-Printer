import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/new", search: { edit: undefined } });
  },
  head: () => ({
    meta: [
      { title: "Receipt Printer" },
      { name: "description", content: "Fill in and print your store receipts." },
      { property: "og:title", content: "Receipt Printer" },
      { property: "og:description", content: "Fill in and print your store receipts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
