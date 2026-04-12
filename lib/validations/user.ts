import { z } from 'zod'

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  role: z.enum(['owner', 'staff']).default('staff'),
  is_active: z.boolean().default(true),
})

export const userUpdateSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().optional(),
  role: z.enum(['owner', 'staff']).optional(),
  is_active: z.boolean().optional(),
})

export type User = z.infer<typeof userSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>
