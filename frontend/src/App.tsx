import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Box, Container, CssBaseline, Paper } from '@mui/material'
import ChatInterface from './components/ChatInterface'
import TherapistAvatar from './components/TherapistAvatar'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF',
    },
    secondary: {
      main: '#CCCCCC',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
  },
})

function App() {
  const [isThinking, setIsThinking] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container 
        maxWidth="md" 
        sx={{ 
          height: '100vh', 
          py: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            height: '90vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box
            sx={{
              flex: '0 0 auto',
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              bgcolor: '#0A0A0A',
            }}
          >
            <TherapistAvatar isThinking={isThinking} />
          </Box>
          <ChatInterface setIsThinking={setIsThinking} />
        </Paper>
      </Container>
    </ThemeProvider>
  )
}

export default App
