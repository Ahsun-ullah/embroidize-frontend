import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  sub_category: z.string().optional(),
  price: z.number().min(0, 'Price must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  meta_title: z.string().min(1, 'Meta Title is required'),
  meta_description: z.string().min(1, 'Meta Description is required'),
  meta_keywords: z.array(z.string()).optional(),
  image: z.any().optional(),
  file: z.any().optional(),
});
export const blogSchema = z.object({
  title: z.string().min(1, 'Blog Title is required'),
  description: z.string().min(1, 'Description is required'),
  meta_title: z.string().min(1, 'Meta Title is required'),
  meta_description: z.string().min(1, 'Meta Description is required'),
  meta_keywords: z.array(z.string()).optional(),
  image: z.any().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  meta_title: z.string().min(1, 'Meta Title is required'),
  meta_description: z.string().min(1, 'Meta Description is required'),
  meta_keywords: z.array(z.string()).optional(),
  image: z.any().optional(),
});
export const subCategorySchema = z.object({
  name: z.string().min(1, 'Subcategory name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  meta_title: z.string().min(1, 'Meta Title is required'),
  meta_description: z.string().min(1, 'Meta Description is required'),
  meta_keywords: z.array(z.string()).optional(),
  image: z.any().optional(),
});
