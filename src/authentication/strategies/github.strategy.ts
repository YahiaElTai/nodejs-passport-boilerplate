import type { VerifyCallback } from 'passport-oauth2';

import OAuth2Strategy from 'passport-oauth2';
import envVariables from '../../environment-variables';
import { BadRequestError, GenericError } from '../../shared/errors';
import User from '../repos/user-repo';
import { UserGithubDraftSchema } from '../validations';

const GITHUB_AUTHORIZATION_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_API_URL = 'https://api.github.com/user';
const SCOPE = ['user:email'];

/**
 * This strategy uses OAuth2 to authenticate users with their GitHub accounts.
 * It fetches the user profile from the GitHub API and validates it against a schema.
 * If the user is found in the local database with Github Id, it returns the user.
 * If the user is not found, it either creates a new user or updates an existing user based on the GitHub login (Account linking).
 */
const GithubStrategy = new OAuth2Strategy(
  {
    authorizationURL: GITHUB_AUTHORIZATION_URL,
    tokenURL: GITHUB_TOKEN_URL,
    clientID: envVariables.GITHUB_CLIENT_ID,
    clientSecret: envVariables.GITHUB_CLIENT_SECRET,
    callbackURL: `${envVariables.BACKEND_URL}/api/v1/auth/github/callback`,
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
      /**
       * once we receive the access token from Github with the correct scope
       * then we can use it to fetch the user profile from GitHub API
       */
      const githubResponse = await fetch(GITHUB_USER_API_URL, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Check if the response is successful
      if (!githubResponse.ok) {
        // if not then send a generic response to the user but log the actual error
        return cb(
          new GenericError(
            `Failed to fetch Github Profile, status: ${githubResponse.status}`,
            {
              cause: githubResponse.statusText,
            },
          ),
        );
      }

      // Parse the GitHub profile JSON response
      const githubProfile = await githubResponse.json();

      // Validate the GitHub profile against a schema
      const validatedGithubProfile =
        UserGithubDraftSchema.safeParse(githubProfile);

      // Check if the validation was successful
      if (!validatedGithubProfile.success) {
        const isEmailUndefinedError = validatedGithubProfile.error.issues.find(
          (issue) => issue.path[0] === 'email' && issue.code === 'invalid_type',
        );

        /**
         * Check if the email is undefined in the GitHub profile
         * Github email is private by default so sometimes it can be undefined
         * If the email is undefined, then clearly inform the user to make it public
         */
        if (isEmailUndefinedError) {
          return cb(
            new BadRequestError(
              'Failed to validate Github Profile, please make sure your email is public on Github',
            ),
          );
        }

        // if a different error occurred then send a generic response to the user
        return cb(
          new GenericError('Failed to validate Github Profile', {
            cause: validatedGithubProfile.error,
          }),
        );
      }

      /**
       * since Github login is the only thing that is required and unique on Github
       * we can find the user in the local database based on the GitHub login
       */
      const foundUserByGithubLogin = await User.findUserByGithubLogin(
        validatedGithubProfile.data.login,
      );

      // If the user is not found by Githib login, then try to find the user by email
      if (!foundUserByGithubLogin) {
        const foundUserByEmail = await User.findUserByEmail(
          validatedGithubProfile.data.email,
        );

        /**
         * If the user is not found by email, then create a new user because now we are sure
         * that the user is not in the database using any strategy
         */
        if (!foundUserByEmail) {
          const createdUser = await User.createUser({
            name: validatedGithubProfile.data.name,
            email: validatedGithubProfile.data.email,
            avatarUrl: validatedGithubProfile.data.avatar_url,
            githubId: validatedGithubProfile.data.login,
          });

          // Return the newly created user to be used at route handler `/auth/github/callback`
          return cb(null, createdUser);
        }

        /**
         * If the user is found by email, then that means they signed up using a different strategy
         * so we can update the user with the Github login and avatar
         */
        const updatedUser = await User.updateUserByEmail(
          foundUserByEmail.email,
          {
            githubId: validatedGithubProfile.data.login,
            avatarUrl:
              validatedGithubProfile.data.avatar_url ||
              foundUserByEmail.avatarUrl,
          },
        );

        return cb(null, updatedUser);
      }

      // Return the found user
      return cb(null, foundUserByGithubLogin);
    } catch (error) {
      if (error instanceof Error) {
        return cb(error);
      }

      return cb(new GenericError('Failed to authenticate with Github'));
    }
  },
);

export default GithubStrategy;
