import { Box } from '@mui/material'

interface TherapistAvatarProps {
  isThinking: boolean
  size?: number
  videoRef?: React.RefObject<HTMLVideoElement>
  isStatic?: boolean
}

const THERAPIST_IMAGE = 'https://www.kristen-mcclure-therapist.com/wp-content/uploads/2024/12/675d715d0aab82b6b53bb153-HeadshotPro-1024x832.png'

const TherapistAvatar = ({ isThinking, size = 300, videoRef, isStatic = true }: TherapistAvatarProps) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#1A1A1A',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      }}
    >
      {isStatic ? (
        <img
          src={THERAPIST_IMAGE}
          alt="Therapist"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
    </Box>
  )
}

export default TherapistAvatar 