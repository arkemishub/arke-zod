import { z } from "zod";

export const projectSchema = z.object({
	key: z.string().min(1, "Project key is required"),
	name: z.string().min(1, "Project name is required"),
	backend_url: z.string().url("Invalid backend URL"),
	access_token: z.string().default(""),
	refresh_token: z.string().default(""),
});

export type Project = z.infer<typeof projectSchema>;
