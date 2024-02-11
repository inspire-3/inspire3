import type { Doc } from "@junobuild/core";
import { z, ZodType} from "zod";

//                  <T extends ZodTypeAny>(type: T, params?: RawCreateParams) => ZodOptional<T>
export const zDoc = <T>(data: ZodType<T>): ZodType<Doc<T>> => z.object({
  key: z.string(),
  description: z.optional(z.string()),
  data: data,
  owner: z.optional(z.string()),
  created_at: z.optional(z.bigint()),
  updated_at: z.optional(z.bigint()),
})
