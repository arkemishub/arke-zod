import { Client } from "@arkejs/client";
import type { Project } from "./validation";

export function initClient(project: Project): Client {
	return new Client({
		serverUrl: project.backend_url,
		project: project.key,
		getSession: async () => ({
			access_token: project.access_token,
			refresh_token: project.refresh_token,
		}),
	});
}
