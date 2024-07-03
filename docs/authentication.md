# Authentication Strategies

## Overview

This project supports 4 distinct authentication strategies to accommodate different user preferences and external service integrations

### 1. GitHub OAuth 2.0

**Description:**
For users preferring to use their existing GitHub accounts, we implement OAuth 2.0 using the `passport-oauth2` package. This method facilitates secure authorization without exposing user credentials to our server, by using GitHub as an authentication provider to grant access tokens. User session management detailed below.

### 2. Google OAuth 2.0

**Description:**
Similar to GitHub authentication, Google OAuth 2.0 allows users to log in using their Google accounts. Utilizing the same general package `passport-oauth2`, this strategy ensures that user authentication is handled securely by Google, and our application only receives an authorization token to access permitted user details. User session management detailed below.

### 3. Magic Emails

**Description:**
Magic Emails, also known as passwordless login, allow users to authenticate by receiving a unique, time-sensitive link. This method eliminates the need for passwords, reducing the risk of password-related security breaches. Upon clicking the link, the user is directly authenticated into the system. This strategy leverages the `sendgrid` package for sending emails and a secure token generator for creating the unique, time-sensitive tokens.

### 4. Email and Password (only during development)

**Description:**
During the development phase, we enable a traditional Email and Password authentication strategy. This method involves users registering with a unique email address and creating a password. The passwords are securely hashed using the `bcrypt` library before being stored in the database, ensuring that even in the event of a data breach, the actual passwords remain protected. This strategy is primarily for internal testing and is disabled on produciton.

## Account Linking

This project supports account linking regardless of the user's signup method, ensuring that all email addresses are valid and properly connected. Authentication is uniformly handled across different methods using `express-session`, which maintain a consistent and secure user experience.

## Session Management

This project uses `express-session` with a `PostgreSQL` store to maintain user sessions. The session configuration includes the following key settings:

- Cookie Max Age: Sessions are configured to expire after 3 days. This means that the session cookie will be valid for 3 days from the time it is created.
- Session TTL (Time To Live): The TTL for sessions stored in PostgreSQL is also set to 3 days. This ensures that the session data in PostgreSQL will be automatically removed 3 days after its creation.
- `disableTouch`: This option is set to true for the PostgreSQL store. With `disableTouch` enabled, the TTL of the session will not be reset on each request. This reduces the number of calls to PostgreSQL, improving performance and reducing load.

3-day session duration strikes a good balance between security and user experience. It provides a sufficient window for users to remain logged in without frequent re-authentication, while also ensuring that inactive sessions are cleared in a timely manner to maintain security.
