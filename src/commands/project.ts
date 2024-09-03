import { Command } from "commander";
import Configstore from "configstore";
import prompts from "prompts";
import { handleError } from "../utils/handle-error";
import { logger } from "../utils/logger";
import { type Project, projectSchema } from "../utils/validation";

const config = new Configstore("arke-zod");

export const project = new Command()
	.name("project")
	.description("Manage projects")
	.addCommand(
		new Command("create")
			.description("Create a new project")
			.action(async () => {
				try {
					const response = await prompts([
						{
							type: "text",
							name: "key",
							message: "Enter project key:",
						},
						{
							type: "text",
							name: "name",
							message: "Enter project name:",
						},
						{
							type: "text",
							name: "backend_url",
							message: "Enter backend URL:",
						},
					]);

					const projects: Project[] = config.get("projects") || [];

					if (projects.some((p) => p.key === response.key)) {
						throw new Error(
							`A project with the key "${response.key}" already exists.`,
						);
					}

					const validatedProject = projectSchema.parse(response);
					projects.push(validatedProject);
					config.set("projects", projects);
					logger.success(
						`Project "${validatedProject.name}" created successfully.`,
					);
				} catch (e) {
					handleError(e);
				}
			}),
	)
	.addCommand(
		new Command("list").description("List all projects").action(() => {
			const projects: Project[] = config.get("projects") || [];
			if (projects.length === 0) {
				logger.warn("No projects found.");
			} else {
				logger.info("Projects:");
				projects.forEach((project, index) => {
					logger.info(`${index + 1}. ${project.name} (${project.backend_url})`);
				});
			}
		}),
	)
	.addCommand(
		new Command("update").description("Update a project").action(async () => {
			try {
				const projects: Project[] = config.get("projects") || [];
				if (projects.length === 0) {
					logger.warn("No projects to update.");
					return;
				}
				const { index } = await prompts({
					type: "select",
					name: "index",
					message: "Select a project to update:",
					choices: projects.map((project, i) => ({
						title: `${project.name} (${project.backend_url})`,
						value: i,
					})),
				});
				const projectIndex = index;
				const updatedProject = await prompts([
					{
						type: "text",
						name: "key",
						message: "Enter new project key:",
						initial: projects[projectIndex].key,
					},
					{
						type: "text",
						name: "name",
						message: "Enter new project name:",
						initial: projects[projectIndex].name,
					},
					{
						type: "text",
						name: "backend_url",
						message: "Enter new backend URL:",
						initial: projects[projectIndex].backend_url,
					},
				]);

				if (
					updatedProject.key !== projects[projectIndex].key &&
					projects.some((p) => p.key === updatedProject.key)
				) {
					throw new Error(
						`A project with the key "${updatedProject.key}" already exists.`,
					);
				}

				const validatedProject = projectSchema.parse(updatedProject);
				projects[projectIndex] = validatedProject;
				config.set("projects", projects);
				logger.success(
					`Project "${validatedProject.name}" updated successfully.`,
				);
			} catch (error) {
				handleError(error);
			}
		}),
	)
	.addCommand(
		new Command("delete").description("Delete a project").action(async () => {
			const projects: Project[] = config.get("projects") || [];
			if (projects.length === 0) {
				logger.warn("No projects to delete.");
				return;
			}
			const { index } = await prompts({
				type: "select",
				name: "index",
				message: "Select a project to delete:",
				choices: projects.map((project, i) => ({
					title: `${project.name} (${project.backend_url})`,
					value: i,
				})),
			});
			projects.splice(index, 1);
			config.set("projects", projects);
			logger.success("Project deleted successfully.");
		}),
	);
