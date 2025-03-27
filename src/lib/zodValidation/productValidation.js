import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .required('Category is required'),
  sub_category: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .required('Subcategory is required'),
  price: z.number().min(1, 'Price must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  metaDescription: z.string().min(1, 'Meta Description is required'),
  tags: z.any().optional(),
  image: z.any().optional(),
  designFile: z.any().optional(),
});
export const categorySchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  metaDescription: z.string().min(1, 'Meta Description is required'),
  tags: z.any().optional(),
  image: z.any().optional(),
});
export const subCategorySchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .required('Category is required'),
  description: z.string().min(1, 'Description is required'),
  metaDescription: z.string().min(1, 'Meta Description is required'),
  tags: z.any().optional(),
  image: z.any().optional(),
});
