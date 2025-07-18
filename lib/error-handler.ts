import { toast } from 'sonner'

// Define ApiError locally since it's exported as type from api.ts
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Custom error types
export class ValidationError extends Error {
  constructor(message: string, public field?: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Access denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(message: string = 'Resource conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Too many requests') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class ServerError extends Error {
  constructor(message: string = 'Internal server error') {
    super(message)
    this.name = 'ServerError'
  }
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error context interface
export interface ErrorContext {
  userId?: string
  accountId?: number
  action?: string
  component?: string
  url?: string
  userAgent?: string
  timestamp?: string
  additionalData?: Record<string, any>
}

// Error logging service
class ErrorLogger {
  private static instance: ErrorLogger
  private logs: Array<{
    error: Error
    context: ErrorContext
    severity: ErrorSeverity
    timestamp: string
  }> = []

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger()
    }
    return ErrorLogger.instance
  }

  log(error: Error, context: ErrorContext = {}, severity: ErrorSeverity = ErrorSeverity.MEDIUM) {
    const logEntry = {
      error,
      context: {
        ...context,
        url: context.url || (typeof window !== 'undefined' ? window.location.href : ''),
        userAgent: context.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
        timestamp: context.timestamp || new Date().toISOString(),
      },
      severity,
      timestamp: new Date().toISOString(),
    }

    this.logs.push(logEntry)
    
    // Log to console
    console.error(`[${severity.toUpperCase()}] ${error.name}: ${error.message}`, {
      error,
      context: logEntry.context,
    })

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(logEntry)
    }

    // Keep only last 100 logs in memory
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100)
    }
  }

  private async sendToErrorService(logEntry: any) {
    try {
      // Example: Send to Sentry, LogRocket, or custom error service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry),
      // })
      
      console.log('Error would be sent to error service:', logEntry)
    } catch (error) {
      console.error('Failed to send error to service:', error)
    }
  }

  getLogs() {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }
}

// Main error handler class
export class ErrorHandler {
  private static logger = ErrorLogger.getInstance()

  static handle(
    error: unknown,
    context: ErrorContext = {},
    options: {
      showToast?: boolean
      severity?: ErrorSeverity
      fallbackMessage?: string
    } = {}
  ) {
    const {
      showToast = true,
      severity = ErrorSeverity.MEDIUM,
      fallbackMessage = 'An unexpected error occurred'
    } = options

    let processedError: Error
    let userMessage: string
    let errorSeverity = severity

    // Process different error types
    if (error instanceof ApiError) {
      processedError = error
      userMessage = this.getApiErrorMessage(error)
      errorSeverity = this.getApiErrorSeverity(error.status)
    } else if (error instanceof ValidationError) {
      processedError = error
      userMessage = `Validation error: ${error.message}`
      errorSeverity = ErrorSeverity.LOW
    } else if (error instanceof AuthenticationError) {
      processedError = error
      userMessage = 'Please log in to continue'
      errorSeverity = ErrorSeverity.MEDIUM
    } else if (error instanceof AuthorizationError) {
      processedError = error
      userMessage = 'You don\'t have permission to perform this action'
      errorSeverity = ErrorSeverity.MEDIUM
    } else if (error instanceof NotFoundError) {
      processedError = error
      userMessage = error.message
      errorSeverity = ErrorSeverity.LOW
    } else if (error instanceof NetworkError) {
      processedError = error
      userMessage = 'Network error. Please check your connection and try again.'
      errorSeverity = ErrorSeverity.MEDIUM
    } else if (error instanceof Error) {
      processedError = error
      userMessage = error.message || fallbackMessage
    } else {
      processedError = new Error(String(error))
      userMessage = fallbackMessage
    }

    // Log the error
    this.logger.log(processedError, context, errorSeverity)

    // Show user notification
    if (showToast) {
      this.showErrorToast(userMessage, errorSeverity)
    }

    return {
      error: processedError,
      message: userMessage,
      severity: errorSeverity,
    }
  }

  private static getApiErrorMessage(error: ApiError): string {
    switch (error.status) {
      case 400:
        return error.message || 'Invalid request. Please check your input.'
      case 401:
        return 'Please log in to continue.'
      case 403:
        return 'You don\'t have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 409:
        return error.message || 'This action conflicts with existing data.'
      case 422:
        return error.message || 'The provided data is invalid.'
      case 429:
        return 'Too many requests. Please wait a moment and try again.'
      case 500:
        return 'Server error. Please try again later.'
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }

  private static getApiErrorSeverity(status: number): ErrorSeverity {
    if (status >= 500) return ErrorSeverity.HIGH
    if (status >= 400) return ErrorSeverity.MEDIUM
    return ErrorSeverity.LOW
  }

  private static showErrorToast(message: string, severity: ErrorSeverity) {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        toast.error(message, {
          duration: 8000,
          action: {
            label: 'Report',
            onClick: () => {
              const subject = encodeURIComponent('Critical Error Report')
              const body = encodeURIComponent(`Error: ${message}\nTime: ${new Date().toISOString()}`)
              window.open(`mailto:support@tradepropjournal.com?subject=${subject}&body=${body}`)
            }
          }
        })
        break
      case ErrorSeverity.MEDIUM:
        toast.error(message, { duration: 5000 })
        break
      case ErrorSeverity.LOW:
        toast.warning(message, { duration: 3000 })
        break
    }
  }

  // Utility methods for specific error types
  static handleValidationError(field: string, message: string, context?: ErrorContext) {
    return this.handle(
      new ValidationError(message, field),
      { ...context, action: 'validation' },
      { severity: ErrorSeverity.LOW }
    )
  }

  static handleNetworkError(status?: number, context?: ErrorContext) {
    return this.handle(
      new NetworkError('Network request failed', status),
      { ...context, action: 'network_request' },
      { severity: ErrorSeverity.MEDIUM }
    )
  }

  static handleAuthError(context?: ErrorContext) {
    return this.handle(
      new AuthenticationError(),
      { ...context, action: 'authentication' },
      { severity: ErrorSeverity.MEDIUM }
    )
  }

  static handleNotFound(resource: string, context?: ErrorContext) {
    return this.handle(
      new NotFoundError(resource),
      { ...context, action: 'resource_access' },
      { severity: ErrorSeverity.LOW }
    )
  }

  // Async error wrapper
  static async withErrorHandling<T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext,
    options?: {
      showToast?: boolean
      fallbackMessage?: string
      onError?: (error: any) => void
    }
  ): Promise<T | null> {
    try {
      return await asyncFn()
    } catch (error) {
      const result = this.handle(error, context, options)
      
      if (options?.onError) {
        options.onError(result.error)
      }
      
      return null
    }
  }

  // Get error logs for debugging
  static getLogs() {
    return this.logger.getLogs()
  }

  // Clear error logs
  static clearLogs() {
    this.logger.clearLogs()
  }
}

// Utility functions for common error scenarios
export const handleApiError = (error: unknown, context?: ErrorContext) => 
  ErrorHandler.handle(error, context)

export const handleFormError = (error: unknown, context?: ErrorContext) =>
  ErrorHandler.handle(error, { ...context, component: 'form' })

export const handleAsyncOperation = <T>(
  operation: () => Promise<T>,
  context?: ErrorContext
) => ErrorHandler.withErrorHandling(operation, context)

// React hook for error handling
export function useErrorHandler() {
  return {
    handleError: (error: unknown, context?: ErrorContext) => 
      ErrorHandler.handle(error, context),
    handleValidationError: (field: string, message: string) =>
      ErrorHandler.handleValidationError(field, message),
    handleNetworkError: (status?: number) =>
      ErrorHandler.handleNetworkError(status),
    handleAuthError: () =>
      ErrorHandler.handleAuthError(),
    handleNotFound: (resource: string) =>
      ErrorHandler.handleNotFound(resource),
    withErrorHandling: <T>(asyncFn: () => Promise<T>) =>
      ErrorHandler.withErrorHandling(asyncFn),
  }
} 