import CustomError from './custom-error';

class GenericError extends CustomError {
  statusCode = 500;
  name = 'GenericError';
}

export default GenericError;
