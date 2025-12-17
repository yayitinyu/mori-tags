import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Form, useActionData, useNavigation, useSearchParams } from "@remix-run/react";
import { createUserSession, getUserId } from "~/utils/auth.server";
import { GlassCard } from "~/components/ui/GlassCard";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await getUserId(request);
    if (userId) return redirect("/");
    return json({});
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const redirectTo = (formData.get("redirectTo") as string) || "/";

    if (!username || !password) {
        return json({ error: "Username and password are required" }, { status: 400 });
    }

    // Verify against DB (Simple check for now)
    const env = (context.cloudflare as any).env as { DB: D1Database };
    const user = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).first<{ id: number, password_hash: string }>();

    if (!user) {
        // For initial setup: if no users exist, create admin
        const count = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first<{ count: number }>();
        if (count?.count === 0 && username === 'admin') {
            // Create admin user (using plain text password for demo/initial setup simplicity as requested)
            // In prod use bcrypt!
            const result = await env.DB.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin') RETURNING id").bind(username, password).first<{ id: number }>();
            if (result) {
                return createUserSession(result.id, redirectTo);
            }
        }
        return json({ error: "Invalid credentials" }, { status: 400 });
    }

    // Password check (Plain text comparison for MVP as requested "Simple account system")
    // TODO: Upgrade to bcrypt
    if (user.password_hash !== password) {
        return json({ error: "Invalid credentials" }, { status: 400 });
    }

    return createUserSession(user.id, redirectTo);
};

export default function Login() {
    const actionData = useActionData<typeof action>();
    const [searchParams] = useSearchParams();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <GlassCard className="login-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h1 style={{ textAlign: 'center', color: 'var(--deep-pink)', marginBottom: '1.5rem' }}>Login</h1>
                <Form method="post">
                    <input type="hidden" name="redirectTo" value={searchParams.get("redirectTo") ?? undefined} />

                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Username</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid white' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid white' }}
                        />
                    </div>

                    {actionData?.error && (
                        <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                            {actionData.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </Form>
                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                    <p>Initial login as 'admin' will create the account.</p>
                </div>
            </GlassCard>
        </div>
    );
}
