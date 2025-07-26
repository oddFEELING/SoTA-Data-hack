import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import rag from "@convex-dev/rag/convex.config";
import prosemirrorSync from "@convex-dev/prosemirror-sync/convex.config";
import presence from "@convex-dev/presence/convex.config";

const app = defineApp();
app.use(agent);
app.use(rag);
app.use(prosemirrorSync);
app.use(presence);

export default app;
