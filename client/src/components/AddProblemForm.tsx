import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Alert,
    IconButton,
    Typography,
    Fade,
    Slide,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { ProblemPlatform } from '../types/Problem';
import { keyframes } from '@mui/system';

interface AddProblemFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { platform: ProblemPlatform; title: string; url: string }) => Promise<void>;
}

const slideUp = keyframes`
  0% { transform: translateY(100px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const AddProblemForm: React.FC<AddProblemFormProps> = ({ open, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        platform: '' as ProblemPlatform | '',
        title: '',
        url: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.platform || !formData.title || !formData.url) {
            setError('All fields are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Form submitting with data:', formData); // Debug log
            
            await onSubmit({
                platform: formData.platform as ProblemPlatform,
                title: formData.title,
                url: formData.url
            });
            
            console.log('Form submission successful'); // Debug log
            
            // Reset form
            setFormData({ platform: '', title: '', url: '' });
            onClose();
        } catch (error: any) {
            console.error('Form submission error:', error); // Debug log
            setError(error.response?.data?.message || error.message || 'Failed to add problem');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ platform: '', title: '', url: '' });
        setError('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'rgba(30, 30, 30, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                    animation: open ? `${slideUp} 0.4s ease-out` : 'none',
                },
            }}
        >
            <DialogTitle
                sx={{
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddIcon sx={{ color: '#4ECDC4' }} />
                    Add New Problem
                </Box>
                <IconButton
                    onClick={handleClose}
                    sx={{
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                            color: '#fff',
                            background: 'rgba(255,255,255,0.1)',
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {error && (
                            <Fade in>
                                <Alert
                                    severity="error"
                                    sx={{
                                        background: 'rgba(244, 67, 54, 0.1)',
                                        border: '1px solid rgba(244, 67, 54, 0.3)',
                                        color: '#fff',
                                        '& .MuiAlert-icon': {
                                            color: '#f44336',
                                        },
                                    }}
                                >
                                    {error}
                                </Alert>
                            </Fade>
                        )}

                        <Slide direction="up" in={open} timeout={300}>
                            <FormControl
                                fullWidth
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: 2,
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 0.15)',
                                        },
                                        '&.Mui-focused': {
                                            background: 'rgba(255, 255, 255, 0.2)',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        '&.Mui-focused': {
                                            color: '#4ECDC4',
                                        },
                                    },
                                    '& .MuiSelect-select': {
                                        color: '#fff',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        color: 'rgba(255, 255, 255, 0.8)',
                                    },
                                }}
                            >
                                <InputLabel>Platform</InputLabel>
                                <Select
                                    value={formData.platform}
                                    label="Platform"
                                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as ProblemPlatform })}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                background: 'rgba(30, 30, 30, 0.95)',
                                                backdropFilter: 'blur(20px)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: 2,
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="LeetCode" sx={{ color: '#fff', '&:hover': { background: 'rgba(255, 161, 22, 0.2)' } }}>
                                        🟡 LeetCode
                                    </MenuItem>
                                    <MenuItem value="Codeforces" sx={{ color: '#fff', '&:hover': { background: 'rgba(25, 118, 210, 0.2)' } }}>
                                        🔵 Codeforces
                                    </MenuItem>
                                    <MenuItem value="CSES" sx={{ color: '#fff', '&:hover': { background: 'rgba(76, 175, 80, 0.2)' } }}>
                                        🟢 CSES
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Slide>

                        <Slide direction="up" in={open} timeout={400}>
                            <TextField
                                fullWidth
                                required
                                label="Problem Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: 2,
                                        color: '#fff',
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 0.15)',
                                        },
                                        '&.Mui-focused': {
                                            background: 'rgba(255, 255, 255, 0.2)',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        '&.Mui-focused': {
                                            color: '#4ECDC4',
                                        },
                                    },
                                }}
                            />
                        </Slide>

                        <Slide direction="up" in={open} timeout={500}>
                            <TextField
                                fullWidth
                                required
                                label="Problem URL"
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: 2,
                                        color: '#fff',
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 0.15)',
                                        },
                                        '&.Mui-focused': {
                                            background: 'rgba(255, 255, 255, 0.2)',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        '&.Mui-focused': {
                                            color: '#4ECDC4',
                                        },
                                    },
                                }}
                            />
                        </Slide>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        onClick={handleClose}
                        sx={{
                            color: 'rgba(255,255,255,0.8)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: 2,
                            px: 3,
                            '&:hover': {
                                background: 'rgba(255,255,255,0.1)',
                                borderColor: 'rgba(255,255,255,0.5)',
                            },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                            borderRadius: 2,
                            px: 4,
                            fontWeight: 'bold',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #26C6DA 30%, #00ACC1 90%)',
                                transform: 'scale(1.05)',
                            },
                            '&:disabled': {
                                background: 'rgba(255,255,255,0.2)',
                                color: 'rgba(255,255,255,0.5)',
                            },
                        }}
                    >
                        {loading ? 'Adding...' : 'Add Problem'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddProblemForm;