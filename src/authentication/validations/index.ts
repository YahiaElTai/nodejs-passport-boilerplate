import z from 'zod';

const TimestampSchema = z.union([z.date(), z.string()]);

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  email: z.string(),
  password: z.string().min(8).nullable().optional(),
  githubId: z.string().nullable().optional(),
  googleId: z.string().nullable().optional(),
  isEmailVerified: z.boolean().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  createdAt: TimestampSchema.nullable().optional(),
  updatedAt: TimestampSchema.nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;

const UserDraftSchema = z.object({
  name: z.string().nullable().optional(),
  email: z.string(),
  password: z.string().min(8).nullable().optional(),
  githubId: z.string().nullable().optional(),
  googleId: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export type UserDraft = z.infer<typeof UserDraftSchema>;

export const UserSessionSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
});
export type UserSession = z.infer<typeof UserSessionSchema>;

export const SessionParamSchema = z.object({
  id: z.string().length(32),
});

export const UserGithubDraftSchema = z.object({
  login: z.string().min(1),
  name: z.string().nullable().optional(),
  email: z.string().email(),
  avatar_url: z.string().url().optional(),
});

export const UserGoogleDraftSchema = z.object({
  sub: z.string().min(5),
  name: z.string().optional(),
  email: z.string().email(),
  email_verified: z.boolean(),
  picture: z.string().url().optional(),
});

export const UserLocalDraftSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(16),
  name: z.string().optional(),
});

export const UserMagicLinkDraftSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
});

export type UserMagicLinkDraft = z.infer<typeof UserMagicLinkDraftSchema>;

export const SignTokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  expiresIn: z.string().optional(),
  claims: z.record(z.any()).optional(),
});

export type SignTokenPayload = z.infer<typeof SignTokenPayloadSchema>;

export const VerifyTokenPayloadSchema = z.object({
  iat: z.number(),
  exp: z.number(),
  sub: z.string().uuid(),
  aud: z.string().url(),
  iss: z.string().url(),
  claims: z.record(z.any()).optional(),
});

export type VerifyTokenPayload = z.infer<typeof VerifyTokenPayloadSchema>;

/** This Schema is shared across different emails.
 * If you require a different Schema for your specific email, you can create a new one below
 */
export const EmailInputSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  link: z.string().url(),
});

export type EmailInput = z.infer<typeof EmailInputSchema>;

export const TokenQueryParamSchema = z.object({
  token: z.string().min(5),
});
