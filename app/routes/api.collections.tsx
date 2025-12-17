import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { getUserId, requireUserId } from "~/utils/auth.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
    const userId = await requireUserId(request);
    const env = (context.cloudflare as any).env as { DB: D1Database };

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "save") {
        const name = formData.get("name") as string;
        const tags = formData.get("tags") as string;

        if (!name || !tags) {
            return json({ error: "Name and tags are required" }, { status: 400 });
        }

        await env.DB.prepare("INSERT INTO collections (user_id, name, tags_string) VALUES (?, ?, ?)")
            .bind(userId, name, tags)
            .run();

        return json({ success: true });
    }

    if (intent === "delete") {
        const id = formData.get("id");
        if (!id) return json({ error: "ID required" }, { status: 400 });

        await env.DB.prepare("DELETE FROM collections WHERE id = ? AND user_id = ?")
            .bind(id, userId)
            .run();

        return json({ success: true });
    }

    return json({ error: "Invalid intent" }, { status: 400 });
};
