import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import { Command } from "commander";
import Configstore from "configstore";
import kebabCase from "lodash.kebabcase";
import ora from "ora";
import { ModuleKind, ScriptTarget, Project as TSMProject } from "ts-morph";
import { parseStructToSchema } from "../core/parsers";
import { handleError } from "../utils/handle-error";
import { initClient } from "../utils/init-client";
import { logger } from "../utils/logger";
import { login } from "../utils/login";
import type { Project } from "../utils/validation";

const config = new Configstore("arke-zod");

const clientErrorMap = {
	401: "Unauthorized, please login to the project",
	403: "Forbidden, make sure to login with a power user account",
};

export const pull = new Command()
	.name("pull")
	.description("Pull data for a specific project")
	.argument("<projectKey>", "The key of the project to pull data for")
	.action(async (projectKey: string) => {
		try {
			const project = findProject(projectKey);

			if (!project) {
				throw new Error(`Project with key "${projectKey}" not found.`);
			}

			await pullStructs(projectKey);
		} catch (error) {
			handleError(error);
		}
	});

function findProject(projectKey: string) {
	const projects: Project[] = config.get("projects") || [];
	const project = projects.find((p) => p.key === projectKey);

	if (!project) {
		throw new Error(`Project with key "${projectKey}" not found.`);
	}

	return project;
}

async function pullStructs(projectKey: string) {
	const project = findProject(projectKey);
	const spinner = ora("Building schemas...\n").start();

	try {
		const client = initClient(project);
		const arkeList = await client.arke
			.getAll()
			.then((res) => res.data.content.items);

		const tsProject = new TSMProject({
			compilerOptions: {
				target: ScriptTarget.ES2015,
				module: ModuleKind.CommonJS,
			},
		});

		for (const arke of arkeList) {
			const parameters = await client.arke
				.struct(arke.id)
				.then((res) => res.data.content);

			const schemaString = await parseStructToSchema(arke, parameters);

			const targetDir = path.join(process.cwd(), "lib/validations/arke");
			const filename = `${kebabCase(arke.id)}.ts`;
			const filePath = path.join(targetDir, filename);

			if (!existsSync(targetDir)) {
				await fs.mkdir(targetDir, { recursive: true });
			}

			const sourceFile = tsProject.createSourceFile(filePath, schemaString, {
				overwrite: true,
			});

			sourceFile.formatText({});
			await sourceFile.save();
		}

		spinner.succeed("Schemas built successfully");
	} catch (error) {
		// @ts-expect-error
		if (error?.response?.status === 401 || error?.response?.status === 403) {
			spinner.stop();
			const message =
				// @ts-expect-error
				clientErrorMap[error.response.status as keyof typeof clientErrorMap];
			logger.warn(message);
			await login(project);
			return pullStructs(projectKey);
		}
		spinner.fail("Failed to build schemas");
		handleError(error);
	}
}
