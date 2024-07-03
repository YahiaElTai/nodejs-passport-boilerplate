import CustomError from './custom-error';

class NotFoundError extends CustomError {
  statusCode = 404;
  name = 'NotFoundError';
}

export default NotFoundError;
