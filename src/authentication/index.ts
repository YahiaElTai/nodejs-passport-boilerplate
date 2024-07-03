import { Router } from 'express';
import passport from 'passport';

import { isProduction } from '../shared/constants';
import { authenticateMiddleware } from '../shared/middlewares';

import { GenericError } from '../shared/errors';
import resendEmail from './routes/email.resend-verification';
import verifyEmailCallback from './routes/email.verify-callback';
import localLogin from './routes/local.login';
import localSignUp from './routes/local.signup';
import magicEmailCallback from './routes/magic-email.callback';
import magicLinkSend from './routes/magic-link.send';
import githubCallback from './routes/oauth.github-callback';
import googleCallback from './routes/oauth.google-callback';
import deleteUser from './routes/user.delete';
import fetchUser from './routes/user.fetch';
import logoutUser from './routes/user.logout';
import GithubStrategy from './strategies/github.strategy';
import GoogleStrategy from './strategies/google.strategy';
import localStrategy from './strategies/local.strategy';
import MagicLinkStrategy from './strategies/magic-link.strategy';
import { UserSessionSchema } from './validations';

const authRouter = Router();

/**
 * This function is called whenever a user signs up or logs in
 * it serializes the user object from the strategy and stores it in the session
 */
passport.serializeUser((user, done) => {
  // we only pass the user ID and email address to the session
  const { success, data, error } = UserSessionSchema.safeParse(user);

  if (!success) {
    return done(
      new GenericError('Failed to parse user session when serializing user.', {
        cause: error.issues,
      }),
    );
  }

  done(null, data);
});

/**
 * This function is called whenever a user makes a request to an authenticated route
 * it deserializes the user object from the session and attaches it to the request object as `req.user`
 */
passport.deserializeUser((session, done) => {
  // Retrieve and validate the user object from the session then pass it to the route handler
  const { success, data, error } = UserSessionSchema.safeParse(session);

  if (!success) {
    return done(
      new GenericError(
        'Failed to parse user session when deserializing user.',
        {
          cause: error.issues,
        },
      ),
    );
  }

  done(null, data);
});

passport.use('github', GithubStrategy);
passport.use('google', GoogleStrategy);
passport.use('magic-link', MagicLinkStrategy);

// allow users to sign in using email and password when NOT in production
// this helps with development and testing
if (!isProduction) {
  passport.use('local', localStrategy);

  authRouter.post('/api/v1/dev/signup', localSignUp);
  authRouter.post(
    '/api/v1/dev/login/password',
    passport.authenticate('local'),
    localLogin,
  );
}

/*
 * Define the routes for different authentication strategies
 *
 **/

// 1. Magic Link Authentication
authRouter.post('/api/v1/auth/magic-link', magicLinkSend);
authRouter.get(
  '/api/v1/auth/magic-link/callback',
  passport.authenticate('magic-link'),
  magicEmailCallback,
);

/**
 * 2. GitHub OAuth Authentication
 * The /auth/github route is used to initiate the GitHub OAuth flow.
 */
authRouter.get('/api/v1/auth/github', passport.authenticate('github'));

// The /auth/github/callback route is used to handle the callback from GitHub's OAuth page.
authRouter.get(
  '/api/v1/auth/github/callback',
  passport.authenticate('github'),
  githubCallback,
);

/**
 * 3. Google OAuth Authentication
 * The /auth/google route is used to initiate the Google OAuth flow.
 */
authRouter.get('/api/v1/auth/google', passport.authenticate('google'));

// The /auth/google/callback route is used to handle the callback from Google's OAuth page.
authRouter.get(
  '/api/v1/auth/google/callback',
  passport.authenticate('google'),
  googleCallback,
);

/*
 * Define the routes for the user management
 *
 **/
authRouter.get('/api/v1/user', authenticateMiddleware, fetchUser);
authRouter.get('/api/v1/user/logout', authenticateMiddleware, logoutUser);
authRouter.delete('/api/v1/user', authenticateMiddleware, deleteUser);

/*
 * Define the routes for email verification
 *
 **/
authRouter.get('/api/v1/email/verify/callback', verifyEmailCallback);
authRouter.post(
  '/api/v1/email/resend-verification',
  authenticateMiddleware,
  resendEmail,
);

export default authRouter;
