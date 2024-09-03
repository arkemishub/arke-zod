import Configstore from "configstore";
import ora from "ora";
import prompts from "prompts";
import { z } from "zod";
import { handleError } from "./handle-error";
import { initClient } from "./init-client";
import type { Project } from "./validation";

const config = new Configstore("arke-zod");

const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required"),
});

const tokenSchema = z.object({
	access_token: z.string().min(1, "Auth failed, please try again"),
	refresh_token: z.string().min(1, "Auth failed, please try again"),
});

export async function login(project: Project) {
	try {
		const client = initClient(project);

		const input = await prompts([
			{
				type: "text",
				name: "username",
				message: "Enter your username:",
			},
			{
				type: "password",
				name: "password",
				message: "Enter your password:",
			},
		]);

		const { username, password } = loginSchema.parse(input);

		const spinner = ora("Logging in").start();
		const data = await client.auth
			.signIn({ username, password })
			.then((res) => res.data.content);

		const { access_token, refresh_token } = tokenSchema.parse(data);

		const projects: Project[] = config.get("projects") || [];
		const updatedProjects = projects.map((p) =>
			p.key === project.key
				? {
						...p,
						access_token,
						refresh_token,
					}
				: p,
		);
		config.set("projects", updatedProjects);
		spinner.succeed("Successfully logged in!");
	} catch (error) {
		handleError(error);
	}
}
