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
}

const ChatInterface = ({ setIsThinking }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your totally qualified therapist. Tell me what's bothering you, and I'll try not to laugh... I mean, help.",
      isUser: false,
    },
  ])
  const [input, setInput] = useState('')
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const speakMessage = async (text: string) => {
    if (!isSpeechEnabled) return

    try {
      const response = await axios.post('http://localhost:8000/api/avatar/speak', {
        text,
      })
      
      if (videoRef.current && response.data.video_url) {
        videoRef.current.src = response.data.video_url
        videoRef.current.play()
      }
    } catch (error) {
      console.error('Error generating speech:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }])
    setIsThinking(true)

    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: userMessage,
      })
      
      const therapistResponse = response.data.response
      setMessages((prev) => [
        ...prev,
        { text: therapistResponse, isUser: false },
      ])
      
      await speakMessage(therapistResponse)
    } catch (error) {
      const errorMessage = "Sorry, I'm having an existential crisis right now. Try again later."
      setMessages((prev) => [
        ...prev,
        { text: errorMessage, isUser: false },
      ])
      await speakMessage(errorMessage)
    } finally {
      setIsThinking(false)
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
                    videoRef={message.isUser ? undefined : videoRef} 
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
      
      {/* Speech Toggle Button */}
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
