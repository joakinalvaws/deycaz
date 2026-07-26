import { z } from "zod";

export const categorySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Obligatorio.")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones."),
  name: z.string().trim().min(1, "Obligatorio."),
  subtitle: z.string().trim().nullable().optional(),
  desde: z.number().positive().nullable().optional(),
  sort_order: z.number().int(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const CATEGORY_FORM_DEFAULTS: CategoryFormValues = {
  slug: "",
  name: "",
  subtitle: null,
  desde: null,
  sort_order: 0,
};
