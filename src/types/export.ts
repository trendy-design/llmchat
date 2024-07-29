import { dataValidator } from "@/helper/validator";
import { z } from "zod";

export type ExportData = z.infer<typeof dataValidator>;
