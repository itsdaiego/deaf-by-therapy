import { useState, useRef, useEffect } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Stack,
  Fab,
  Tooltip,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import axios from 'axios'
import TherapistAvatar from './TherapistAvatar'

interface Message {
  text: string
  isUser: boolean
}

interface ChatInterfaceProps {
  setIsThinking: (thinking: boolean) => void
  videoRef: React.RefObject<HTMLVideoElement>
}

const ChatInterface = ({ setIsThinking, videoRef }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your totally qualified therapist. Tell me what's bothering you, and I'll try not to laugh... I mean, help.",
      isUser: false,
    },
  ])
  const [input, setInput] = useState('')
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const pollForVideo = async (talkId: string, maxAttempts = 30): Promise<string | null> => {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(`http://localhost:3000/api/avatar/speak/${talkId}`)
        
        if (response.data.video_url) {
          console.log("Got video URL:", response.data.video_url)
          return response.data.video_url
        } else {
          console.log("No video URL yet, attempt:", attempts + 1)
        }
      } catch (error) {
        console.error('Error polling for video:', error)
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    }
    
    console.error("Max polling attempts reached without getting a video URL")
    return null
  }

  const handleTherapistResponse = async (text: string) => {
    setMessages((prev) => [...prev, { text, isUser: false }])
    
    if (isSpeechEnabled) {
      try {
        console.log("Creating talk with text:", text)
        const createResponse = await axios.post('http://localhost:3000/api/avatar/speak', {
          text,
        })
        
        if (!createResponse.data.id) {
          console.error("No talk ID received from create response")
          return
        }

        const talkId = createResponse.data.id
        console.log("Got talk ID:", talkId)
        
        const videoUrl = await pollForVideo(talkId)
        if (videoRef.current && videoUrl) {
          console.log("Playing video URL:", videoUrl)
          videoRef.current.src = videoUrl
          await videoRef.current.play()
        } else {
          console.error("Failed to get video URL after polling")
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error generating speech:', error.response?.data || error.message)
        } else {
          console.error('Error generating speech:', error)
        }
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }])
    setIsThinking(true)
    setIsProcessing(true)

    try {
      const response = await axios.post('http://localhost:3000/api/chat', {
        message: userMessage,
      })
      
      const therapistResponse = response.data.response
      await handleTherapistResponse(therapistResponse)
    } catch (error) {
      const errorMessage = "Sorry, I'm having an existential crisis right now. Try again later."
      await handleTherapistResponse(errorMessage)
    } finally {
      setIsThinking(false)
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      bgcolor: '#080808',
      margin: '0 auto',
      width: '100%',
      maxWidth: '800px',
      position: 'relative',
    }}>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <Stack
          spacing={2}
          sx={{
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                px: 2,
              }}
            >
              {!message.isUser && (
                <Box sx={{ mr: 2, alignSelf: 'flex-end' }}>
                  <TherapistAvatar 
                    isThinking={false} 
                    size={40} 
                    isStatic={true}
                  />
                </Box>
              )}
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  width: 'auto',
                  bgcolor: message.isUser ? '#1A1A1A' : '#262626',
                  borderRadius: message.isUser ? '12px 12px 0 12px' : '12px 12px 12px 0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                <Typography 
                  color={message.isUser ? '#FFFFFF' : '#E0E0E0'}
                  sx={{ 
                    textAlign: 'left',
                    wordBreak: 'break-word',
                  }}
                >
                  {message.text}
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: '#0A0A0A', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          width: '100%',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          maxWidth: '600px',
          margin: '0 auto',
          px: 2,
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Tell me your problems..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#1A1A1A',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim()}
            sx={{
              alignSelf: 'flex-end',
              p: 1,
              bgcolor: '#1A1A1A',
              '&:hover': {
                bgcolor: '#262626',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Tooltip title={isSpeechEnabled ? "Disable Speech" : "Enable Speech"}>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            right: 32,
            bottom: 32,
            bgcolor: isSpeechEnabled ? '#1A1A1A' : '#262626',
            '&:hover': {
              bgcolor: isSpeechEnabled ? '#262626' : '#1A1A1A',
            },
          }}
          onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
        >
          {isSpeechEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
        </Fab>
      </Tooltip>
    </Box>
  )
}

export default ChatInterface 
