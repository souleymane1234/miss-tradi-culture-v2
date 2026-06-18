import { ApiHttpError } from '../errors/api-http-error'
import { parseProblemDetails } from '../errors/problem-details'
import type { HttpRequest } from '../types/http-request'

const DEFAULT_UPLOAD_TIMEOUT_MS = 120_000

function joinUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl.replace(/\/+$/, '')}${normalizedPath}`
}

function readResponseBody(xhr: XMLHttpRequest): unknown {
  const raw = xhr.responseText?.trim()
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return raw
  }
}

function throwUploadHttpError(
  xhr: XMLHttpRequest,
  url: string,
  body: unknown,
): never {
  const problem = parseProblemDetails(body)
  const bodyMessage =
    body && typeof body === 'object' && 'message' in body && typeof (body as Record<string, unknown>).message === 'string'
      ? ((body as Record<string, unknown>).message as string)
      : undefined
  const message =
    problem?.detail ??
    problem?.title ??
    bodyMessage ??
    (xhr.statusText || 'Upload failed')

  throw new ApiHttpError({
    message: String(message),
    status: xhr.status || 0,
    statusText: xhr.statusText || 'Upload Error',
    url,
    method: 'POST',
    problemDetails: problem,
    responseBody: body,
  })
}

export type XhrMultipartUploadOptions = {
  baseUrl: string
  path: string
  file: File
  fieldName?: string
  token?: string | null
  acceptLanguage?: string
  timeoutMs?: number
}

/**
 * Upload multipart via XMLHttpRequest — plus fiable que fetch pour les gros fichiers
 * et certains proxies HTTP/2 (Railway).
 */
export function xhrMultipartUpload<TResponse>(options: XhrMultipartUploadOptions): Promise<TResponse> {
  const {
    baseUrl,
    path,
    file,
    fieldName = 'file',
    token,
    acceptLanguage = 'fr-FR,fr;q=0.9,*;q=0.8',
    timeoutMs = DEFAULT_UPLOAD_TIMEOUT_MS,
  } = options

  const url = joinUrl(baseUrl, path)
  const form = new FormData()
  form.append(fieldName, file, file.name)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.timeout = timeoutMs
    xhr.setRequestHeader('Accept', 'application/json, application/problem+json;q=0.9, */*;q=0.1')
    xhr.setRequestHeader('Accept-Language', acceptLanguage)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    xhr.onload = () => {
      const body = readResponseBody(xhr)
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as TResponse)
        return
      }
      try {
        throwUploadHttpError(xhr, url, body)
      } catch (err) {
        reject(err)
      }
    }

    xhr.onerror = () => {
      reject(
        new ApiHttpError({
          message:
            'Connexion interrompue lors de l\'envoi du fichier. Verifiez votre reseau ou reessayez avec un fichier plus leger.',
          status: 0,
          statusText: 'Network Error',
          url,
          method: 'POST' satisfies HttpRequest['method'],
        }),
      )
    }

    xhr.ontimeout = () => {
      reject(
        new ApiHttpError({
          message: 'Delai depasse lors de l\'envoi du fichier. Essayez un fichier plus leger.',
          status: 0,
          statusText: 'Timeout',
          url,
          method: 'POST' satisfies HttpRequest['method'],
        }),
      )
    }

    xhr.onabort = () => {
      reject(
        new ApiHttpError({
          message: 'Envoi du fichier annule.',
          status: 0,
          statusText: 'Aborted',
          url,
          method: 'POST' satisfies HttpRequest['method'],
        }),
      )
    }

    xhr.send(form)
  })
}
