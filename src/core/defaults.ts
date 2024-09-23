export const defaultSchemas = [
	{
		id: "unit",
		template: `export const unitSchema = z.object({
            active: z.boolean(),
            arke_id: z.string(),
            id: z.string(),
            metadata: z.record(z.string(), z.unknown()),
            label: z.string(),
            type: z.string(),
            inserted_at: z.string().datetime(),
            updated_at: z.string().datetime(),
        })`,
	},
];
