import type { EmailInput } from '../validations';

import sgMail from '@sendgrid/mail';
import envVariables from '../../environment-variables';
import { GenericError } from '../../shared/errors';
import { EmailInputSchema } from '../validations';

sgMail.setApiKey(envVariables.SENDGRID_API_KEY);

export const sendVerificationEmail = async (options: EmailInput) =>
  sendEmailHelper(
    options,
    envVariables.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID,
    'Auth-Template-Dev: Verify Your Email',
  );

export const sendSignUpMagicLinkEmail = async (options: EmailInput) =>
  sendEmailHelper(
    options,
    envVariables.SENDGRID_SIGNUP_MAGIC_LINK_TEMPLATE_ID,
    'Secure One-Click Sign Up to Auth-Template-Dev',
  );

export const sendLoginMagicLinkEmail = async (options: EmailInput) =>
  sendEmailHelper(
    options,
    envVariables.SENDGRID_LOGIN_MAGIC_LINK_TEMPLATE_ID,
    'Secure One-Click Login to Auth-Template-Dev',
  );

const sendEmailHelper = async (
  options: EmailInput,
  templateId: string,
  subject: string,
) => {
  const validatedOptions = EmailInputSchema.safeParse(options);

  // if the input is invalid, throw an error with the validation issues
  if (!validatedOptions.success) {
    /**
     * if we get to this point in the email sending process, then it's a backend error
     * and not the user's fault so we send a generic error to the user
     * and fully log the error for debugging
     */
    throw new GenericError(validatedOptions.error.message, {
      cause: validatedOptions.error,
    });
  }

  const { name, email, link } = validatedOptions.data;

  // If we don't need module specific FROM, then we can just use the default email defined in the environment variables
  const EmailFrom = {
    email: envVariables.SENDGRID_DEFAULT_FROM_EMAIL,
    name: envVariables.SENDGRID_DEFAULT_FROM_NAME,
  };

  const emailToBeSend = {
    from: EmailFrom,
    replyTo: EmailFrom,
    to: { email, name },
    templateId,
    subject,
    dynamicTemplateData: {
      name,
      link,
    },
  };

  return sgMail.send(emailToBeSend);
};
