export default class ValidationError extends Error {
  data?: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.name = "ValidationError";
    this.data = data;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
