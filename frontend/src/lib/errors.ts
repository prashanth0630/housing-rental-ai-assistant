type ApiError = {
  message?: string
  response?: {
    status?: number
    data?: {
      message?: string
    } | string
  }
}

export function apiErrorStatus(error: unknown): number | undefined {
  return (error as ApiError).response?.status
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiError
  const data = apiError.response?.data

  if (typeof data === 'string' && data) {
    return data
  }

  if (typeof data === 'object' && data?.message) {
    return data.message
  }

  return apiError.message || fallback
}
