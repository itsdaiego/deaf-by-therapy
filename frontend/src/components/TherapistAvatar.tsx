import { motion } from 'framer-motion'
import { Box } from '@mui/material'

interface TherapistAvatarProps {
  isThinking: boolean
}

const TherapistAvatar = ({ isThinking }: TherapistAvatarProps) => {
  return (
    <Box
      sx={{
        width: 200,
        height: 200,
        position: 'relative',
        backgroundColor: '#1A1A1A',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Eyes */}
      <motion.div
        style={{
          position: 'absolute',
          display: 'flex',
          gap: '40px',
          top: '60px',
        }}
        animate={
          isThinking
            ? {
                y: [0, -10, 0],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                },
              }
            : {}
        }
      >
        <motion.div
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
          }}
          animate={{
            scale: [1, 1.2, 1],
            transition: {
              duration: 2,
              repeat: Infinity,
            },
          }}
        />
        <motion.div
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
          }}
          animate={{
            scale: [1, 1.2, 1],
            transition: {
              duration: 2,
              repeat: Infinity,
              delay: 0.3,
            },
          }}
        />
      </motion.div>

      {/* Mouth */}
      <motion.div
        style={{
          position: 'absolute',
          width: '100px',
          height: '40px',
          border: '8px solid #FFFFFF',
          borderRadius: '0 0 40px 40px',
          borderTop: 'none',
          bottom: '50px',
        }}
        animate={
          isThinking
            ? {
                scaleX: [1, 0.6, 1],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                },
              }
            : {
                scaleX: [1, 1.2, 1],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                },
              }
        }
      />
    </Box>
  )
}

export default TherapistAvatar 