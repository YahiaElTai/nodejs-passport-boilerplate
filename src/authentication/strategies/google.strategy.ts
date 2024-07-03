import type { VerifyCallback } from 'passport-oauth2';

import OAuth2Strategy from 'passport-oauth2';

import envVariables from '../../environment-variables';
import { BadRequestError, GenericError } from '../../shared/errors';
import User from '../repos/user-repo';
import { UserGoogleDraftSchema } from '../validations';

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_USER_API_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const SCOPE = ['email', 'profile'];

/**
 * It uses the OAuth2 protocol to obtain user information from Google.
 * The strategy fetches the user's profile from the Google API using the access token.
 * It then validates the profile against a schema and checks if the user already exists in the database.
 * If the user does not exist, a new user is created with the retrieved profile information.
 * If the user already exists, their profile information is updated in the database.
 */
const GoogleStrategy = new OAuth2Strategy(
  {
    authorizationURL: GOOGLE_AUTHORIZATION_URL,
    tokenURL: GOOGLE_TOKEN_URL,
    clientID: envVariables.GOOGLE_CLIENT_ID,
    clientSecret: envVariables.GOOGLE_CLIENT_SECRET,
    callbackURL: `${envVariables.BACKEND_URL}/api/v1/auth/google/callback`,
    scope: SCOPE,
    state: true,
  },
  async (
    accessToken: string,
    _refreshToken: string,
    _profile: unknown,
    cb: VerifyCallback,
  ) => {
    try {
      // Use the received access token to fetch the user profile from Google API.
      const googleResponse = await fetch(GOOGLE_USER_API_URL, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!googleResponse.ok) {
        return cb(
          new GenericError(
            `Failed to fetch Google Profile, status: ${googleResponse.status}`,
            {
              cause: googleResponse.statusText,
            },
          ),
        );
      }

      const googleProfile = await googleResponse.json();

      const validatedGoogleProfile =
        UserGoogleDraftSchema.safeParse(googleProfile);

      if (!validatedGoogleProfile.success) {
        return cb(
          new GenericError('Failed to validate Google Profile', {
            cause: validatedGoogleProfile.error,
          }),
        );
      }

      /**
       * For Google authentication, we request the 'email' scope.
       * This allows us to locate users who have registered using their Google account.
       * we can always be sure that the email is defined because we requested the 'email' scope
       */
      const foundUser = await User.findUserByEmail(
        validatedGoogleProfile.data.email,
      );

      // If the user is not found by email, then we create a new user
      if (!foundUser) {
        // Ensure the user's email is verified by Google before creating a new account. This helps prevent spam.
        if (!validatedGoogleProfile.data.email_verified) {
          return cb(
            new BadRequestError(
              'Failed to validate Google Profile, please verify your email with Google',
            ),
          );
        }

        const createdUser = await User.createUser({
          name: validatedGoogleProfile.data.name,
          email: validatedGoogleProfile.data.email,
          avatarUrl: validatedGoogleProfile.data.picture,
          googleId: validatedGoogleProfile.data.sub,
        });

        // Return the new user for the `/auth/google/callback` route handler.
        return cb(null, createdUser);
      }

      /**
       * Update the user's picture and name in the database if they have changed
       * This is useful if the user updates their Google profile picture or name
       */
      const updatedUser = await User.updateUserByEmail(foundUser.email, {
        name: validatedGoogleProfile.data.name || foundUser.name,
        avatarUrl: validatedGoogleProfile.data.picture || foundUser.avatarUrl,
        googleId: validatedGoogleProfile.data.sub,
      });

      return cb(null, updatedUser);
    } catch (error) {
      if (error instanceof Error) {
        return cb(error);
      }

      return cb(new GenericError('Failed to authenticate with Google'));
    }
  },
);

export default GoogleStrategy;
