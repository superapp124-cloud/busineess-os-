/**
 * Base error class for all CHATR runtime errors.
 */
export class RuntimeError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(message: string, code = 'RUNTIME_ERROR', context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown by the Kernel during boot or registration failures.
 */
export class KernelError extends RuntimeError {
  constructor(message: string, code = 'KERNEL_ERROR', context?: Record<string, any>) {
    super(message, code, context);
  }
}

/**
 * Thrown by the Identity Runtime for authentication or identity failures.
 */
export class IdentityError extends RuntimeError {
  constructor(message: string, code = 'IDENTITY_ERROR', context?: Record<string, any>) {
    super(message, code, context);
  }
}

/**
 * Thrown by the Connector Runtime during OAuth or external service integration failures.
 */
export class ConnectorError extends RuntimeError {
  constructor(message: string, code = 'CONNECTOR_ERROR', context?: Record<string, any>) {
    super(message, code, context);
  }
}

/**
 * Thrown by the Security Runtime for token or access violation failures.
 */
export class SecurityError extends RuntimeError {
  constructor(message: string, code = 'SECURITY_ERROR', context?: Record<string, any>) {
    super(message, code, context);
  }
}

/**
 * Thrown by the Workflow Runtime during workflow execution failures.
 */
export class WorkflowError extends RuntimeError {
  constructor(message: string, code = 'WORKFLOW_ERROR', context?: Record<string, any>) {
    super(message, code, context);
  }
}

/**
 * Thrown by the Context Runtime when context limits or retrieval fail.
 */
export class ContextError extends RuntimeError {
  constructor(message: string, code = 'CONTEXT_ERROR', context?: Record<string, any>) {
    super(message, code, context);
  }
}
