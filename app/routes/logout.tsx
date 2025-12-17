import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { logout } from "~/utils/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    return logout(request);
};

export const loader = async () => {
    return null;
};
