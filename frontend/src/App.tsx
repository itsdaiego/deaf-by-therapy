import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Box, Container, CssBaseline, Paper } from '@mui/material'
import ChatInterface from './components/ChatInterface'
import TherapistAvatar from './components/TherapistAvatar'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BB86FC',
    },
    secondary: {
      main: '#03DAC6',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
})

function App() {
  const [isThinking, setIsThinking] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ height: '100vh', py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              flex: '0 0 auto',
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
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
