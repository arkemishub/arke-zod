// This file will be deleted when @arkejs/client will be updated to get correct types

export type BaseParameter = {
	id: string;
	label: string;
	type:
		| "datetime"
		| "dict"
		| "string"
		| "link"
		| "dynamic"
		| "date"
		| "integer"
		| "float"
		| "boolean"
		| "binary";
	required: boolean;
};

export type DynamicParameter = BaseParameter & {
	type: "dynamic";
};

export type DateTimeParameter = BaseParameter & {
	type: "datetime";
};

export type DateParameter = BaseParameter & {
	type: "date";
};

export type DictParameter = BaseParameter & {
	type: "dict";
	default: Record<string, any> | null;
};

export type StringParameter = BaseParameter & {
	type: "string";
	default: string | null;
	max_length: number | null;
	min_length: number | null;
	multiple: boolean;
	required: boolean;
	strip: boolean;
	values: string[] | null;
};

export type IntegerParameter = BaseParameter & {
	type: "integer";
	max: number | null;
	min: number | null;
	multiple: boolean;
	values: number[] | null;
};

export type FloatParameter = BaseParameter & {
	type: "float";
	max: number | null;
	min: number | null;
	multiple: boolean;
	values: number[] | null;
};

export type LinkParameter = BaseParameter & {
	default: string | null;
	filter_keys: string[];
	type: "link";
	link_ref: {
		active: boolean;
		arke_id: string;
		id: string;
		inserted_at: string | null;
		label: string;
		metadata: Record<string, any>;
		parameters: Record<string, any>[];
		type: string;
		updated_at: string | null;
	};
};

export type BooleanParameter = BaseParameter & {
	type: "boolean";
	default: boolean | null;
};

export type BinaryParameter = BaseParameter & {
	type: "binary";
};

export type Parameter =
	| DynamicParameter
	| DateTimeParameter
	| DateParameter
	| DictParameter
	| StringParameter
	| IntegerParameter
	| FloatParameter
	| LinkParameter
	| BooleanParameter
	| BinaryParameter;
