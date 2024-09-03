import type { TStruct, TUnit } from "@arkejs/client";
import camelCase from "lodash.camelcase";
import type { Parameter } from "../utils/temp-types";

const MIN_MAX_BLACKLIST = ["arke_id"];

export async function parseStructToSchema(arke: TUnit, struct: TStruct) {
	const schemaName = `${camelCase(arke.id)}Schema`;
	const parameters = struct.parameters.filter(
		(param) => param.type !== "dynamic",
	) as Parameter[];

	const schemaContent = parameters
		.map((param) => {
			const zodStr = [
				parseType(param),
				parseRequired(param),
				parseMinMax(param),
			].join("");
			return `${param.id}: ${zodStr},`;
		})
		.join("\n");

	return `import { z } from "zod";\n
        export const ${schemaName} = z.object({
            ${schemaContent}
        });`;
}

function parseType(parameter: Parameter) {
	switch (parameter.type) {
		case "datetime":
			return "z.string().datetime()";
		case "date":
			return "z.string().date()";
		case "dict":
			return "z.record(z.string(), z.unknown())";
		case "link":
		case "string":
			return "z.string()";
		case "float":
			return "z.number()";
		case "integer":
			return "z.number().int()";
		default:
			throw new Error(`Unknown type: ${parameter.type}`);
	}
}

function parseRequired(parameter: Parameter) {
	if (!parameter.required) return ".optional()";
	return "";
}

function parseMinMax(parameter: Parameter) {
	if (MIN_MAX_BLACKLIST.includes(parameter.id)) return "";

	let result = "";

	if (parameter.type === "string") {
		if (parameter.min_length) result += `.min(${parameter.min_length})`;
		if (parameter.max_length) result += `.max(${parameter.max_length})`;
	} else if (parameter.type === "integer" || parameter.type === "float") {
		if (parameter.min) result += `.gte(${parameter.min})`;
		if (parameter.max) result += `.lte(${parameter.max})`;
	}

	return result;
}
