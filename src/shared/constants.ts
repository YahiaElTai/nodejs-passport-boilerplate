import envVariables from '../environment-variables';

export const isProduction = envVariables.NODE_ENV === 'production';
export const isTest = envVariables.NODE_ENV === 'test';
export const isDevelopment = envVariables.NODE_ENV === 'development';

export const GENERIC_ERROR_MESSAGE =
  'Something went wrong. If the issue persist, please contact our support team.';

export const NOT_ALLOWED_BY_CORS = 'Not allowed by CORS';

export const allowedOrigins = [
  'http://localhost:5173',
  'https://bytesphere.dev',
];
