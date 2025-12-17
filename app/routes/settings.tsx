import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { GlassCard } from "~/components/ui/GlassCard";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
    const userId = await requireUserId(request);
    const env = (context.cloudflare as any).env as { DB: D1Database };
    const user = await env.DB.prepare("SELECT username FROM users WHERE id = ?").bind(userId).first<{ username: string }>();
    if (!user) return redirect("/logout");
    return json({ user });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
    const userId = await requireUserId(request);
    const env = (context.cloudflare as any).env as { DB: D1Database };
    const formData = await request.formData();

    const oldPassword = formData.get("oldPassword") as string;
    const newUsername = formData.get("newUsername") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!oldPassword) {
        return json({ error: "Current password is required to make changes." }, { status: 400 });
    }

    // Verify old password
    const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first<{ id: number, password_hash: string }>();
    if (!user || user.password_hash !== oldPassword) {
        return json({ error: "Incorrect current password." }, { status: 400 });
    }

    // Update Username
    if (newUsername && newUsername.trim() !== "") {
        try {
            await env.DB.prepare("UPDATE users SET username = ? WHERE id = ?").bind(newUsername, userId).run();
        } catch (e) {
            return json({ error: "Username already taken." }, { status: 400 });
        }
    }

    // Update Password
    if (newPassword && newPassword.trim() !== "") {
        await env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newPassword, userId).run();
    }

    return json({ success: true, message: "Settings updated successfully." });
};

export default function Settings() {
    const { user } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    return (
        <div className="container" style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <GlassCard style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ color: 'var(--deep-pink)', margin: 0 }}>Account Settings</h1>
                    <Link to="/" className="btn btn-glass" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>Back to Home</Link>
                </div>

                <Form method="post">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Current Username</label>
                        <input type="text" disabled value={user.username} className="glass-panel" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.2)', color: '#666' }} />
                    </div>

                    <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.5)', margin: '1.5rem 0' }} />

                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="newUsername" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>New Username (Optional)</label>
                        <input
                            type="text"
                            name="newUsername"
                            id="newUsername"
                            placeholder="Leave blank to keep current"
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid white' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>New Password (Optional)</label>
                        <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            placeholder="Leave blank to keep current"
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid white' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="oldPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--deep-pink)' }}>Current Password (Required)</label>
                        <input
                            type="password"
                            name="oldPassword"
                            id="oldPassword"
                            required
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '2px solid var(--secondary-pink)' }}
                        />
                    </div>

                    {actionData?.error && (
                        <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                            {actionData.error}
                        </div>
                    )}

                    {actionData?.success && (
                        <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center', background: 'rgba(0,255,0,0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                            {actionData.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem' }}
                    >
                        Save Changes
                    </button>
                </Form>
            </GlassCard>
        </div>
    );
}
