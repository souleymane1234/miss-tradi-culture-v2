import type { ApplyToEditionBodyDto } from './api/modules/emission/emission.types'
import { ApiHttpError } from './api'
import {
  validateCandidaturePhotoFile,
  validateCandidatureVideoFile,
  type CandidatureFormInput,
} from './candidature-utils'
import { emissionRequest } from './emission-request'
import { normalizeUploadFile } from './upload-file-utils'
import { uploadApi, videoApi } from '../services/api-client'

function wrapUploadError(step: 'photo' | 'video', error: unknown): ApiHttpError {
  if (ApiHttpError.isInstance(error)) {
    if (error.status === 500 || error.message.toLowerCase().includes('interne')) {
      return new ApiHttpError({
        message:
          step === 'photo'
            ? 'Envoi de la photo impossible (service de stockage indisponible). Reessayez plus tard ou contactez le support.'
            : 'Envoi de la video impossible (service de stockage indisponible). Reessayez plus tard ou contactez le support.',
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        method: error.method,
        problemDetails: error.problemDetails,
        responseBody: error.responseBody,
        cause: error,
      })
    }
    return error
  }
  const message =
    step === 'photo'
      ? 'Envoi de la photo impossible. Verifiez le format (max 2 Mo) et reessayez.'
      : 'Envoi de la video impossible. Verifiez le format (max 50 Mo) et reessayez.'
  return new ApiHttpError({
    message,
    status: 0,
    statusText: 'Upload Error',
    url: step === 'photo' ? '/api/v1/uploads/image' : '/api/v1/uploads/video',
    method: 'POST',
    cause: error,
  })
}

export async function submitCandidature(editionId: string, input: CandidatureFormInput) {
  const photoFile = normalizeUploadFile(input.photoFile, 'photo')
  const videoFile = normalizeUploadFile(input.videoFile, 'video')

  const photoError = validateCandidaturePhotoFile(photoFile)
  if (photoError) throw new Error(photoError)

  const videoError = validateCandidatureVideoFile(videoFile)
  if (videoError) throw new Error(videoError)

  let candidatePicture: string
  try {
    candidatePicture = await uploadApi.uploadImage(photoFile)
  } catch (error) {
    throw wrapUploadError('photo', error)
  }

  let videoUrl: string
  try {
    videoUrl = await uploadApi.uploadVideo(videoFile)
  } catch (error) {
    throw wrapUploadError('video', error)
  }

  const video = await videoApi.create({
    title: input.videoTitle.trim() || `Candidature ${input.pseudo.trim()}`,
    url: videoUrl,
    sourceType: 'UPLOAD',
    categoryId: null,
    premiumRequired: false,
    status: 'EN_ATTENTE',
    duration: 180,
    description: input.description.trim(),
    tags: ['miss-tradi', 'candidature'],
  })

  const body: ApplyToEditionBodyDto = {
    pseudo: input.pseudo.trim(),
    candidateName: input.candidateName.trim(),
    candidatePreName: input.candidatePreName.trim(),
    age: input.birthDate,
    candidatePicture,
    description: input.description.trim(),
    videoId: video.id,
    countryId: input.countryId,
    residenceCountryId: input.residenceCountryId,
    categoryId: input.categoryId,
    tagId: input.tagId,
  }

  return emissionRequest.applyToEdition(editionId, body)
}
