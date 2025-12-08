import { z } from "zod";

const fileOrStringSchema = z.union([z.instanceof(File), z.string()]);

export const postFormDataSchema = z.object({
  type: z.string(),
  category_id: z.number(),
  title: z.string().min(3, "title_validation"),
  description: z.string().min(10, "desc_validation"),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  price: z.string().regex(/^[0-9]+(\.[0-9]{1,2})?$/, "price_vlaidation"),
  firm_price: z.union([z.literal(0), z.literal(1)]),
  virtual_tour: z.union([z.literal(0), z.literal(1)]),
  delivery_method: z.string(),
  is_promote: z
    .union([z.literal(0), z.literal(1)])
    .optional()
    .or(z.literal("")),
  image: fileOrStringSchema,
  images: z.array(fileOrStringSchema).optional().or(z.literal("")),
  condition: z.string().nullable().optional(),
  zip_code: z
    .string()
    .regex(/^[0-9]{5}$/, "zipcode_validation")
    .optional()
    .or(z.literal("")),
  features: z.array(z.string().min(3)).optional().or(z.literal("")),
  options: z.array(
    z.object({
      category_option_id: z.number(),
      value: z.union([z.string(), z.number()]),
    })
  ),
  country_id: z.string().min(1, "country_validation"),
});

export type PostFormData = z.infer<typeof postFormDataSchema>;
