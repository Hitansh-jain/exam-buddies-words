import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/mock/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <div style={{padding:20}}>Simple mock {id}</div>;
  },
});
