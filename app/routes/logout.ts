import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { logout } from "~/utils/auth.server";

export const loader: LoaderFunction = async () => redirect("/");
export const action: ActionFunction = async ({ request }) => logout(request);
