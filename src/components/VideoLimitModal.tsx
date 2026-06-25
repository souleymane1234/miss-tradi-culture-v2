import { useEffect } from 'react'
import { MAX_VIDEO_FILE_BYTES } from '../lib/upload-file-utils'
import { formatFileSize } from '../lib/candidature-utils'
import './VideoLimitModal.css'

type VideoLimitModalProps = {
  message: string
  onClose: () => void
}

export function VideoLimitModal({ message, onClose }: VideoLimitModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="video-limit-modal" role="presentation" onClick={onClose}>
      <div
        className="video-limit-modal__dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="video-limit-title"
        aria-describedby="video-limit-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="video-limit-modal__icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="video-limit-modal__eyebrow">Fichier trop volumineux</p>
        <h2 id="video-limit-title">Video trop lourde</h2>
        <p id="video-limit-desc" className="video-limit-modal__text">
          {message}
        </p>
        <p className="video-limit-modal__limit">
          Taille maximale autorisee :{' '}
          <strong>{formatFileSize(MAX_VIDEO_FILE_BYTES)}</strong>
        </p>
        <button type="button" className="video-limit-modal__btn" onClick={onClose}>
          Compris
        </button>
      </div>
    </div>
  )
}
