/**
 * Structured Error Logging Utility
 *
 * Provides consistent error logging across the application
 * In production, this can be extended to send errors to external services
 * like Sentry, LogRocket, or custom error tracking systems
 */

export interface LogContext {
  context: string;
  error: Error | unknown;
  additionalData?: Record<string, unknown>;
  userId?: string;
}

/**
 * Log an error with structured context
 *
 * @param options - Logging context and error information
 *
 * @example
 * ```ts
 * try {
 *   await fetchData();
 * } catch (error) {
 *   logger.error({
 *     context: 'DataFetch',
 *     error,
 *     additionalData: { endpoint: '/api/data', method: 'GET' }
 *   });
 * }
 * ```
 */
function error({ context, error: err, additionalData, userId }: LogContext): void {
  // Format error message
  const timestamp = new Date().toISOString();
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : undefined;

  // In development: log to console with full details
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${timestamp}] [${context}]`, {
      message: errorMessage,
      stack: errorStack,
      additionalData,
      userId,
    });
    return;
  }

  // In production: send to error tracking service
  // TODO: Integrate with Sentry, LogRocket, or similar service
  //
  // Example Sentry integration:
  // Sentry.captureException(err, {
  //   contexts: {
  //     custom: {
  //       context,
  //       additionalData,
  //       userId,
  //     },
  //   },
  // });

  // For now, log to console in production as well
  // Remove this once proper error tracking is set up
  console.error(`[${timestamp}] [${context}]`, errorMessage);
}

/**
 * Log an informational message
 *
 * @param context - Context identifier for the log
 * @param message - Informational message
 * @param data - Optional additional data
 */
function info(context: string, message: string, data?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${context}]`, message, data || '');
  }
}

/**
 * Log a warning message
 *
 * @param context - Context identifier for the log
 * @param message - Warning message
 * @param data - Optional additional data
 */
function warn(context: string, message: string, data?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] [${context}]`, message, data || '');
}

/**
 * Log a debug message (only in development)
 *
 * @param context - Context identifier for the log
 * @param message - Debug message
 * @param data - Optional additional data
 */
function debug(context: string, message: string, data?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[${context}]`, message, data || '');
  }
}

export const logger = {
  error,
  info,
  warn,
  debug,
};

export default logger;
