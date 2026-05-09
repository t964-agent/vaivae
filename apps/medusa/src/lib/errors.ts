type ErrorDetails = Record<string, unknown>;

type VaivaeBackendErrorOptions = {
  code: string;
  message: string;
  statusCode?: number;
  details?: ErrorDetails;
  cause?: unknown;
};

class VaivaeBackendError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: ErrorDetails;

  constructor(options: VaivaeBackendErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = new.target.name;
    this.code = options.code;
    this.statusCode = options.statusCode ?? 500;

    if (options.details) {
      this.details = options.details;
    }
  }
}

function backendErrorOptions(
  options: Omit<VaivaeBackendErrorOptions, "cause" | "details">,
  details?: ErrorDetails,
  cause?: unknown,
): VaivaeBackendErrorOptions {
  const next: VaivaeBackendErrorOptions = options;

  if (details) {
    next.details = details;
  }

  if (cause !== undefined) {
    next.cause = cause;
  }

  return next;
}

class ValidationError extends VaivaeBackendError {
  constructor(message: string, details?: ErrorDetails) {
    super(backendErrorOptions({ code: "VALIDATION_ERROR", message, statusCode: 400 }, details));
  }
}

class NotFoundError extends VaivaeBackendError {
  constructor(message: string, details?: ErrorDetails) {
    super(backendErrorOptions({ code: "NOT_FOUND", message, statusCode: 404 }, details));
  }
}

class IntegrationError extends VaivaeBackendError {
  constructor(message: string, details?: ErrorDetails, cause?: unknown) {
    super(
      backendErrorOptions({ code: "INTEGRATION_ERROR", message, statusCode: 502 }, details, cause),
    );
  }
}

class ConsentError extends VaivaeBackendError {
  constructor(message: string, details?: ErrorDetails) {
    super(backendErrorOptions({ code: "CONSENT_ERROR", message, statusCode: 403 }, details));
  }
}

module.exports = {
  ConsentError,
  IntegrationError,
  NotFoundError,
  VaivaeBackendError,
  ValidationError,
};
