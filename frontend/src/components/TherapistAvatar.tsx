import { useState, useRef } from 'react'
import { Box, IconButton, Tooltip } from '@mui/material'
import MicIcon from '@mui/icons-material/Mic'

interface TherapistAvatarProps {
  isThinking: boolean
  size?: number
  videoRef?: React.RefObject<HTMLVideoElement>
}

const TherapistAvatar = ({ isThinking, size = 300, videoRef }: TherapistAvatarProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleSpeak = async () => {
    setIsSpeaking(true)
    try {
      const response = await fetch('http://localhost:8000/api/avatar/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hello, I am your AI therapist. How are you feeling today?'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      const data = await response.json()
      if (videoRef && data.video_url) {
        videoRef.current!.src = data.video_url
        videoRef.current!.play()
      }
    } catch (error) {
      console.error('Error generating speech:', error)
    } finally {
      setIsSpeaking(false)
    }
  }

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
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      
      <Tooltip title="Speak">
        <IconButton
          onClick={handleSpeak}
          disabled={isSpeaking}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <MicIcon />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default TherapistAvatar 