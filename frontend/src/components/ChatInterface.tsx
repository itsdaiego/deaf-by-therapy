import { useState, useRef, useEffect } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Stack,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import axios from 'axios'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      
      setMessages((prev) => [
        ...prev,
        { text: response.data.response, isUser: false },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I'm having an existential crisis right now. Try again later.",
          isUser: false,
        },
      ])
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((message, index) => (
          <Stack
            key={index}
            direction="row"
            justifyContent={message.isUser ? 'flex-end' : 'flex-start'}
          >
            <Paper
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: message.isUser ? 'primary.dark' : 'background.paper',
                borderRadius: 2,
              }}
            >
              <Typography>{message.text}</Typography>
            </Paper>
          </Stack>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

export default ChatInterface 