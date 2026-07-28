import { z } from "zod";

export const pollFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  category: z.number().min(0).max(7),
  options: z
    .array(z.string().min(1, "Option cannot be empty").max(100, "Option too long"))
    .min(2, "At least 2 options are required")
    .max(6, "Maximum 6 options allowed"),
  durationDays: z.number().min(1, "Minimum duration is 1 day").max(30, "Maximum duration is 30 days"),
});

export type PollFormData = z.infer<typeof pollFormSchema>;

export const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username cannot exceed 32 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bio: z.string().max(200, "Bio cannot exceed 200 characters"),
  profile_image_url: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
