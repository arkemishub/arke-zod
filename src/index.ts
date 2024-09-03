#!/usr/bin/env node
import { Command } from "commander";

import { project } from "./commands/project";
import { pull } from "./commands/pull";
import { getPackageInfo } from "./utils/get-package-info";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

async function main() {
	const packageInfo = await getPackageInfo();

	const program = new Command()
		.name("arke-zod")
		.description("Turn arke structs into zod schemas")
		.version(
			packageInfo.version || "1.0.0",
			"-v, --version",
			"display the version number",
		);

	program.addCommand(project).addCommand(pull);

	program.parse();
}

main();
