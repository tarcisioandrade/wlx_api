const validator = (body: any, schema: Zod.Schema) => schema.parse(body);

export default validator