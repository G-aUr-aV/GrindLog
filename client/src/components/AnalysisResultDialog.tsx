import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Psychology as PsychologyIcon } from '@mui/icons-material';

interface AnalysisResultDialogProps {
  open: boolean;
  onClose: () => void;
  analysisResult: any; // The structure from the new prompt
}

const AnalysisResultDialog: React.FC<AnalysisResultDialogProps> = ({ open, onClose, analysisResult }) => {
  if (!analysisResult) {
    return null;
  }

  const { analysisTitle, overallFeedback, problemBreakdown, nextSteps } = analysisResult;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
        <PsychologyIcon sx={{ color: '#4ECDC4' }} />
        {analysisTitle}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#4ECDC4', mb: 1 }}>Overall Feedback</Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>{overallFeedback}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#4ECDC4', mb: 2 }}>Problem Breakdown</Typography>
          {problemBreakdown.map((problem: any, index: number) => (
            <Paper key={index} sx={{ p: 2, mb: 2, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 'bold' }}>{problem.title}</Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>{problem.feedback}</Typography>
            </Paper>
          ))}
        </Box>

        <Box>
          <Typography variant="h6" sx={{ color: '#4ECDC4', mb: 1 }}>Next Steps</Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>{nextSteps}</Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#4ECDC4' }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnalysisResultDialog;