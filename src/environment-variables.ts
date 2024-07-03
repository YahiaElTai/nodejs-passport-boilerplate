process.loadEnvFile();

import z from 'zod';

const string = z
  .string({
    required_error: 'environment variable must be defined.',
  })
  .min(1, { message: 'environment variable must be non empty string.' })
  .trim();

const sessionSecretsSchema = string
  .transform((val) => val.split(',').map((secret) => secret.trim()))
  .refine((arr) => arr.every((secret) => secret.length >= 128), {
    message:
      'Each session secret must be at least 128 characters long. Please check the SESSION_SECRETS_ARRAY environment variable.',
  });

const environmentVariablesSchema = z.object({
  FRONTEND_URL: string.url(),
  BACKEND_URL: string.url(),
  NODE_ENV: string,
  PORT: string.optional(),
  JWT_SECRET: string,
  GITHUB_CLIENT_ID: string,
  GITHUB_CLIENT_SECRET: string,
  GOOGLE_CLIENT_ID: string,
  GOOGLE_CLIENT_SECRET: string,
  SENDGRID_API_KEY: string,
  SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID: string,
  SENDGRID_SIGNUP_MAGIC_LINK_TEMPLATE_ID: string,
  SENDGRID_LOGIN_MAGIC_LINK_TEMPLATE_ID: string,
  SENDGRID_DEFAULT_FROM_EMAIL: string.email(),
  SENDGRID_DEFAULT_FROM_NAME: string,
  SESSION_SECRETS_ARRAY: sessionSecretsSchema,
  POSTGRES_HOST: string,
  POSTGRES_DB: string,
  POSTGRES_TEST_DB: string,
  POSTGRES_USER: string,
  POSTGRES_PASSWORD: string,
  POSTGRES_PORT: string.transform((val) => Number.parseInt(val)),
});

type environmentVariables = z.infer<typeof environmentVariablesSchema>;

/**
 *
 * In Node.js, modules are cached after the first time they are loaded.
 * This means that the first time the config.js module is imported,
 * Node.js will execute its code including the environment variable parsing using Zod and then cache the exported results.
 * Any subsequent require or import of that module in other parts of your application will reuse the cached module.
 * This effectively means that the parsing of the environment variables will only occur once,
 * no matter how many times or where the config.js module is imported.
 * This improves performance since parsing is done only once.
 */
const validateEnvVariables = (): environmentVariables => {
  const { success, data, error } = environmentVariablesSchema.safeParse(
    process.env,
  );

  if (!success) {
    console.error('Environment variable validation failed', error.errors);
    process.exit(1);
  }

  return data;
};

const envVariables = validateEnvVariables();

export default envVariables;
