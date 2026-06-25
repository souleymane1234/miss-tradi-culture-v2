import { buildApiEnvironment } from '../../config/api-environment'
import { xhrMultipartUpload } from '../../adapters/xhr-multipart-upload'
import type { TokenProvider } from '../../ports/token-provider.port'
import { validateVideoFileSize } from '../../../upload-file-utils'
import { parseUploadUrl } from './parse-upload-url'
import { UPLOAD_API_PATHS, type UploadApiPaths } from './upload.paths'
import type { UploadEnvelopeDto } from './upload.types'

export interface UploadApi {
  uploadImage(file: File): Promise<string>
  uploadVideo(file: File): Promise<string>
}

export type CreateUploadApiOptions = {
  getToken?: TokenProvider
  paths?: UploadApiPaths
}

function uploadFile(path: string, file: File, getToken?: TokenProvider): Promise<string> {
  const env = buildApiEnvironment()
  return Promise.resolve(getToken?.() ?? null).then((token) =>
    xhrMultipartUpload<UploadEnvelopeDto>({
      baseUrl: env.baseUrl,
      path,
      file,
      fieldName: 'file',
      token,
      acceptLanguage: env.acceptLanguage,
    }).then(parseUploadUrl),
  )
}

export function createUploadApi(options: CreateUploadApiOptions = {}): UploadApi {
  const paths = options.paths ?? UPLOAD_API_PATHS
  const { getToken } = options

  return {
    uploadImage(file) {
      return uploadFile(paths.image, file, getToken)
    },
    uploadVideo(file) {
      const sizeError = validateVideoFileSize(file)
      if (sizeError) {
        return Promise.reject(new Error(sizeError))
      }
      return uploadFile(paths.video, file, getToken)
    },
  }
}
