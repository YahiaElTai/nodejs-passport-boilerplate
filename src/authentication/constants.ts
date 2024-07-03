export const defaultJWTExpiration = '1h';

/**
 * This provides a good balance between security and user experience.
 * The user will be logged out after 3 days of inactivity.
 */
export const cookieMaxAge = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

export const JWT_PURPOSES = {
  EMAIL_VERIFICATION: 'email-verification',
  MAGIC_LINK_SIGN_UP: 'magic-link-sign-up',
  MAGIC_LINK_LOGIN: 'magic-link-login',
};
