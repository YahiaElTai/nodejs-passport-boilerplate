import CustomError from './custom-error';

class BadRequestError extends CustomError {
  statusCode = 400;
  name = 'BadRequestError';
}

export default BadRequestError;
