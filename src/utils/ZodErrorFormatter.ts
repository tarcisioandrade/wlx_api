import { ZodError } from "zod";

function zodErrorFormatter(err: ZodError) {
  return err.issues.map((issue) => ({
    path: issue.path[0],
    message: issue.message,
  }));
}

export default zodErrorFormatter;