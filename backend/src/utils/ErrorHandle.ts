class ErrorHandle {
  public status;
  public message;
  public stack;
  public code;

  constructor(code, message, status = '', stack = '') {
    this.message = message;
    this.status = status;
    this.stack = stack;
    this.code = code;
  }
}

export default ErrorHandle;
