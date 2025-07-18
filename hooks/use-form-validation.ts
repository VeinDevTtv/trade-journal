import { useState, useCallback } from 'react'
import { z } from 'zod'
import { ErrorHandler, ValidationError } from '@/lib/error-handler'

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  firstError?: string
}

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>
  onValidationError?: (errors: Record<string, string>) => void
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export function useFormValidation<T>({
  schema,
  onValidationError,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormValidationOptions<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isValidating, setIsValidating] = useState(false)

  const validateField = useCallback(
    (fieldName: string, value: any): string | null => {
      try {
        // Validate the entire form with just this field to get proper validation
        const testData = { [fieldName]: value }
        schema.parse(testData)
        return null
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find(err => 
            err.path.includes(fieldName)
          )
          return fieldError?.message || 'Invalid value'
        }
        return 'Validation error'
      }
    },
    [schema]
  )

  const validateForm = useCallback(
    async (data: any): Promise<ValidationResult> => {
      setIsValidating(true)
      
      try {
        const validatedData = schema.parse(data)
        setErrors({})
        
        return {
          isValid: true,
          errors: {},
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formErrors: Record<string, string> = {}
          
          error.errors.forEach((err) => {
            const fieldName = err.path.join('.')
            formErrors[fieldName] = err.message
          })
          
          setErrors(formErrors)
          
          if (onValidationError) {
            onValidationError(formErrors)
          }
          
          // Log validation errors
          ErrorHandler.handleValidationError(
            Object.keys(formErrors)[0] || 'form',
            Object.values(formErrors)[0] || 'Validation failed',
            { component: 'form-validation' }
          )
          
          return {
            isValid: false,
            errors: formErrors,
            firstError: Object.values(formErrors)[0],
          }
        }
        
        // Handle unexpected validation errors
        const errorMessage = error instanceof Error ? error.message : 'Validation failed'
        ErrorHandler.handle(error, { 
          action: 'form_validation',
          component: 'form-validation' 
        })
        
        return {
          isValid: false,
          errors: { form: errorMessage },
          firstError: errorMessage,
        }
      } finally {
        setIsValidating(false)
      }
    },
    [schema, onValidationError]
  )

  const validateFieldAsync = useCallback(
    async (fieldName: string, value: any): Promise<string | null> => {
      try {
        const error = validateField(fieldName, value)
        
        if (error) {
          setErrors(prev => ({ ...prev, [fieldName]: error }))
        } else {
          setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[fieldName]
            return newErrors
          })
        }
        
        return error
      } catch (error) {
        const errorMessage = 'Field validation failed'
        setErrors(prev => ({ ...prev, [fieldName]: errorMessage }))
        return errorMessage
      }
    },
    [validateField]
  )

  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      if (validateOnChange) {
        validateFieldAsync(fieldName, value)
      } else if (touched[fieldName] && errors[fieldName]) {
        // Clear error if field was previously invalid
        validateFieldAsync(fieldName, value)
      }
    },
    [validateOnChange, touched, errors, validateFieldAsync]
  )

  const handleFieldBlur = useCallback(
    (fieldName: string, value: any) => {
      setTouched(prev => ({ ...prev, [fieldName]: true }))
      
      if (validateOnBlur) {
        validateFieldAsync(fieldName, value)
      }
    },
    [validateOnBlur, validateFieldAsync]
  )

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }))
  }, [])

  const getFieldProps = useCallback(
    (fieldName: string) => ({
      error: errors[fieldName],
      hasError: !!errors[fieldName],
      isTouched: touched[fieldName],
      onChange: (value: any) => handleFieldChange(fieldName, value),
      onBlur: (value: any) => handleFieldBlur(fieldName, value),
    }),
    [errors, touched, handleFieldChange, handleFieldBlur]
  )

  const isFieldValid = useCallback(
    (fieldName: string) => !errors[fieldName],
    [errors]
  )

  const hasErrors = Object.keys(errors).length > 0
  const isFormValid = !hasErrors && !isValidating

  return {
    // Validation state
    errors,
    hasErrors,
    isFormValid,
    isValidating,
    touched,
    
    // Validation methods
    validateForm,
    validateField: validateFieldAsync,
    isFieldValid,
    
    // Error management
    clearErrors,
    clearFieldError,
    setFieldError,
    
    // Field helpers
    getFieldProps,
    handleFieldChange,
    handleFieldBlur,
    
    // Utilities
    getFirstError: () => Object.values(errors)[0] || null,
    getErrorCount: () => Object.keys(errors).length,
    getFieldError: (fieldName: string) => errors[fieldName] || null,
  }
}

// Specialized hooks for common schemas
export function useTradeValidation() {
  const { createTradeSchema } = require('@/lib/validation')
  return useFormValidation({ schema: createTradeSchema })
}

export function useAccountValidation() {
  const { createAccountSchema } = require('@/lib/validation')
  return useFormValidation({ schema: createAccountSchema })
}

// Helper hook for async form submission with validation
export function useValidatedSubmit<T>(
  schema: z.ZodSchema<T>,
  onSubmit: (data: T) => Promise<void> | void,
  options?: {
    onSuccess?: () => void
    onError?: (error: any) => void
    showSuccessToast?: boolean
    successMessage?: string
  }
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const validation = useFormValidation({ schema })

  const handleSubmit = useCallback(
    async (data: any) => {
      if (isSubmitting) return

      setIsSubmitting(true)
      
      try {
        const result = await validation.validateForm(data)
        
        if (!result.isValid) {
          return result
        }

        await onSubmit(data)
        
        if (options?.showSuccessToast !== false) {
          const { toast } = await import('sonner')
          toast.success(options?.successMessage || 'Operation completed successfully')
        }
        
        if (options?.onSuccess) {
          options.onSuccess()
        }
        
        return { isValid: true, errors: {} }
      } catch (error) {
        const result = ErrorHandler.handle(error, {
          action: 'form_submit',
          component: 'validated-submit'
        })
        
        if (options?.onError) {
          options.onError(result.error)
        }
        
        return {
          isValid: false,
          errors: { form: result.message },
          firstError: result.message,
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, validation, onSubmit, options]
  )

  return {
    ...validation,
    handleSubmit,
    isSubmitting,
  }
} 