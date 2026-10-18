import React, { useEffect } from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { Mic, MicOff } from '@mui/icons-material';
import useSpeechInput from '../services/useSpeechInput';

/**
 * Reusable microphone button component for voice input
 * 
 * @param {Function} onTranscript - Callback function when speech is recognized
 * @param {string} tooltipText - Optional tooltip text (default: "Voice input")
 * @param {Object} sx - Optional Material-UI sx prop for styling
 */
const VoiceMicButton = ({ onTranscript, tooltipText = "Voice input", sx = {} }) => {
  const { transcript, isListening, isSupported, startListening, stopListening, error } = useSpeechInput();

  // Call the callback when transcript changes
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  // Don't render if browser doesn't support speech recognition
  if (!isSupported) {
    return null;
  }

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Tooltip title={isListening ? "Listening... Click to stop" : tooltipText}>
      <Box sx={{ display: 'inline-block', position: 'relative' }}>
        <IconButton
          onClick={handleClick}
          color={isListening ? "error" : "primary"}
          sx={{
            ...sx,
            animation: isListening ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.7)',
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(255, 0, 0, 0)',
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)',
              },
            },
          }}
        >
          {isListening ? <MicOff /> : <Mic />}
        </IconButton>
        {error && (
          <Tooltip title={error} open={true}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
          </Tooltip>
        )}
      </Box>
    </Tooltip>
  );
};

export default VoiceMicButton;
