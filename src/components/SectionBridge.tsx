import './SectionBridge.css'

type SectionBridgeProps = {
  variant?: 'wave' | 'ribbon'
}

export function SectionBridge({ variant = 'wave' }: SectionBridgeProps) {
  if (variant === 'ribbon') {
    return <div className="section-bridge section-bridge--ribbon" aria-hidden="true" />
  }

  return (
    <div className="section-bridge section-bridge--wave" aria-hidden="true">
      <svg
        className="section-bridge__svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          className="section-bridge__fill"
          d="M0,80V35C180,8 360,8 540,22s360,28 540,22 360-35 540-22 360,14 360,14V80H0Z"
        />
        <path
          className="section-bridge__line"
          d="M0,42C200,12 400,12 600,28s400,32 600,28 400-38 600-28 400,18 840,22"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="nonScalingStroke"
        />
      </svg>
    </div>
  )
}
