import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { getUserId } from "~/utils/auth.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
    const userId = await getUserId(request);
    if (!userId) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const env = (context.cloudflare as any).env as { DB: D1Database };
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "add") {
        const name = formData.get("name") as string;
        const category = (formData.get("category") as string) || "Custom";
        const name_zh = (formData.get("name_zh") as string) || "";

        if (!name || !name.trim()) {
            return json({ error: "Name is required" }, { status: 400 });
        }

        try {
            // Check if tag already exists for this user
            const existing = await env.DB.prepare(
                "SELECT id FROM custom_tags WHERE user_id = ? AND name = ?"
            ).bind(userId, name.trim()).first();

            if (existing) {
                return json({ success: true, message: "Tag already exists", id: existing.id });
            }

            const result = await env.DB.prepare(
                "INSERT INTO custom_tags (user_id, name, category, name_zh) VALUES (?, ?, ?, ?)"
            ).bind(userId, name.trim(), category, name_zh).run();

            return json({ success: true, id: result.meta.last_row_id });
        } catch (e: any) {
            return json({ error: e.message }, { status: 500 });
        }
    }

    if (intent === "delete") {
        const id = formData.get("id");
        if (!id) {
            return json({ error: "ID is required" }, { status: 400 });
        }

        try {
            await env.DB.prepare(
                "DELETE FROM custom_tags WHERE id = ? AND user_id = ?"
            ).bind(id, userId).run();
            return json({ success: true });
        } catch (e: any) {
            return json({ error: e.message }, { status: 500 });
        }
    }

    return json({ error: "Invalid intent" }, { status: 400 });
};
