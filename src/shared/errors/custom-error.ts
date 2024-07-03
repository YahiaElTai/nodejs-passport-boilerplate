abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract name: string;

  constructor(message: string, { cause }: { cause?: unknown } = {}) {
    super(message, { cause });

    /**
     * Set the prototype explicitly to maintain the prototype chain of subclasses.
     * `new.target` points to the constructor that was actually called (not necessarily CustomError).
     * This is crucial when the class is extended further, ensuring instances have the correct prototype.
     * which is crucial for things like instanceof checks to work correctly in TypeScript and JavaScript.
     */
    Object.setPrototypeOf(this, new.target.prototype);

    // Improves the stack trace by excluding this constructor.
    Error.captureStackTrace(this, new.target);
  }
}

export default CustomError;
