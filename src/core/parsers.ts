import type { TStruct, TUnit } from "@arkejs/client";
import camelCase from "lodash.camelcase";
import type { Parameter } from "../utils/temp-types";

const MIN_MAX_BLACKLIST = ["arke_id"];

export function parseStructToSchema(id: string, struct: TStruct) {
	const parameters = struct.parameters.filter(
		(param) => param.type !== "dynamic",
	) as Parameter[];

	const schemaStr = buildSchemaString(id, parameters);
	return buildSchemaOutput(id, schemaStr);
}

export function parseDefaultSchema(id: string, template: string) {
	return buildSchemaOutput(id, template);
}

function buildSchemaOutput(id: string, schemaStr: string) {
	const importStr = buildImportString();
	const typeStr = buildTypeString(id);

	return `${importStr}\n
            ${schemaStr}\n
            ${typeStr}`;
}

export function buildSchemaString(id: string, parameters: Parameter[]) {
	const schemaName = getSchemaName(id);

	const schemaContent = parameters
		.map((param) => {
			const zodStr = [
				parseType(param),
				parseMinMax(param),
				parseRequired(param),
				parseDefault(param),
			].join("");
			return `${param.id}: ${zodStr},`;
		})
		.join("\n");

	return `export const ${schemaName} = z.object({
        ${schemaContent}
    });`;
}

function getSchemaName(id: string) {
	return `${camelCase(id)}Schema`;
}

function buildImportString() {
	return `// This file is auto-generated by arke-zod, do not edit it manually\n
            import { z } from "zod";`;
}

function buildTypeString(id: string) {
	const typeName =
		camelCase(id).charAt(0).toUpperCase() + camelCase(id).slice(1);
	return `export type ${typeName} = z.infer<typeof ${getSchemaName(id)}>;`;
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
		case "boolean":
			return "z.boolean()";
		case "binary":
			return "z.string()";
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

function parseDefault(parameter: Parameter) {
	let defaultValue: string | null = parameter.default;
	if (
		defaultValue !== undefined &&
		defaultValue !== null &&
		(typeof defaultValue !== "object" || Object.keys(defaultValue).length > 0)
	) {
		if (parameter.type === "string") {
			defaultValue = `"${defaultValue}"`;
		}

		return `.default(${defaultValue})`;
	}

	return "";
}
