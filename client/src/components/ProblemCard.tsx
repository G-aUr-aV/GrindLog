import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
    Chip,
    Link,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Fade,
    Popper,
    Divider,
} from '@mui/material';
import {
    OpenInNew as OpenInNewIcon,
    DeleteOutline as DeleteIcon,
    Code as CodeIcon,
    Terminal as TerminalIcon,
    Computer as ComputerIcon,
    Schedule as ScheduleIcon,
    AccessTime as AccessTimeIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { Problem } from '../types/Problem';

interface ProblemCardProps {
    problem: Problem;
    onDelete: (id: string) => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onDelete }) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [timeTooltipOpen, setTimeTooltipOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleDeleteClick = (e: React.MouseEvent) => {
        try {
            e.preventDefault();
            e.stopPropagation();
            setDeleteDialogOpen(true);
        } catch (error) {
            console.error('Error in handleDeleteClick:', error);
        }
    };

    const handleDeleteConfirm = () => {
        try {
            if (problem?._id && onDelete) {
                onDelete(problem._id);
                setDeleteDialogOpen(false);
            } else {
                console.error('Cannot delete: missing problem ID or onDelete function');
            }
        } catch (error) {
            console.error('Error in handleDeleteConfirm:', error);
            setDeleteDialogOpen(false);
        }
    };

    const handleTimeClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setTimeTooltipOpen((prev) => !prev);
    };

    const handleTimeMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setTimeTooltipOpen(true);
    };

    const handleTimeMouseLeave = () => {
        setTimeTooltipOpen(false);
    };

    const formatSubmissionTime = (timestamp: string | Date) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffInMs = now.getTime() - date.getTime();
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            let relativeTime;
            if (diffInMinutes < 1) {
                relativeTime = 'Just now';
            } else if (diffInMinutes < 60) {
                relativeTime = `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
            } else if (diffInHours < 24) {
                relativeTime = `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
            } else if (diffInDays < 7) {
                relativeTime = `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
            } else {
                relativeTime = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }

            const dateOnly = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });

            const timeOnly = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            return { 
                relativeTime, 
                dateOnly, 
                timeOnly
            };
        } catch (error) {
            console.error('Error formatting time:', error);
            return { 
                relativeTime: 'Unknown', 
                dateOnly: 'Unknown date',
                timeOnly: 'Unknown time'
            };
        }
    };

    const getPlatformIcon = () => {
        try {
            const platform = problem?.platform || '';
            const IconComponent = (() => {
                switch (platform) {
                    case 'LeetCode':
                        return CodeIcon;
                    case 'Codeforces':
                        return TerminalIcon;
                    case 'CSES':
                        return ComputerIcon;
                    default:
                        return CodeIcon;
                }
            })();

            return (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    <IconComponent sx={{ fontSize: 20 }} />
                </span>
            );
        } catch (error) {
            console.error('Error in getPlatformIcon:', error);
            return (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    <CodeIcon sx={{ fontSize: 20 }} />
                </span>
            );
        }
    };

    const getPlatformColor = () => {
        try {
            const platform = problem?.platform || '';
            switch (platform) {
                case 'LeetCode':
                    return '#FFA116';
                case 'Codeforces':
                    return '#1976D2';
                case 'CSES':
                    return '#4CAF50';
                default:
                    return '#757575';
            }
        } catch (error) {
            console.error('Error in getPlatformColor:', error);
            return '#757575';
        }
    };

    // Early return if problem is not provided
    if (!problem) {
        return (
            <Card sx={{ mb: 2, p: 2 }}>
                <Typography color="error">Problem data is not available</Typography>
            </Card>
        );
    }

    // Get formatted time using problem.timestamp
    const submissionTime = problem?.timestamp || new Date();
    const { relativeTime, dateOnly, timeOnly } = formatSubmissionTime(submissionTime);

    return (
        <>
            <Card
                sx={{
                    mb: 2,
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    '&:hover': {
                        background: 'rgba(255, 255, 255, 0.12)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                        '& .delete-button': {
                            opacity: 1,
                            transform: 'translateX(0)',
                        },
                        '& .time-indicator': {
                            opacity: 1,
                            transform: 'translateX(0)',
                        }
                    },
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1, mr: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Chip
                                    icon={getPlatformIcon()}
                                    label={problem?.platform || 'Unknown'}
                                    clickable={true}
                                    onClick={() => {
                                        const platformUrls = {
                                            'LeetCode': 'https://leetcode.com',
                                            'CSES': 'https://cses.fi',
                                            'Codeforces': 'https://codeforces.com',
                                        };

                                        const url = platformUrls[problem?.platform] || `https://google.com/search?q=${problem?.platform}`;
                                        window.open(url, '_blank');
                                    }}
                                    sx={{
                                        background: `linear-gradient(45deg, ${getPlatformColor()}20 30%, ${getPlatformColor()}40 90%)`,
                                        color: getPlatformColor(),
                                        border: `1px solid ${getPlatformColor()}40`,
                                        fontWeight: 'bold',
                                        cursor: 'default',
                                        '& .MuiChip-icon': {
                                            color: getPlatformColor(),
                                            pointerEvents: 'none',
                                        },
                                        '& .MuiChip-label': {
                                            pointerEvents: 'none',
                                        },
                                    }}
                                />

                                {/* Time Indicator Chip */}
                                <Chip
                                    icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                                    label={relativeTime}
                                    className="time-indicator"
                                    onClick={handleTimeClick}
                                    onMouseEnter={handleTimeMouseEnter}
                                    onMouseLeave={handleTimeMouseLeave}
                                    sx={{
                                        opacity: 0,
                                        transform: 'translateX(-10px)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        background: 'linear-gradient(45deg, rgba(76, 175, 80, 0.2) 30%, rgba(76, 175, 80, 0.4) 90%)',
                                        color: '#4CAF50',
                                        border: '1px solid rgba(76, 175, 80, 0.4)',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, rgba(76, 175, 80, 0.3) 30%, rgba(76, 175, 80, 0.5) 90%)',
                                            transform: 'scale(1.05)',
                                        },
                                        '& .MuiChip-icon': {
                                            color: '#4CAF50',
                                        },
                                    }}
                                />
                            </Box>

                            <Typography
                                variant="h6"
                                component="h3"
                                sx={{
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    mb: 2,
                                    lineHeight: 1.3,
                                }}
                            >
                                {problem?.title || 'Untitled Problem'}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {problem?.url ? (
                                    <Link
                                        href={problem.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            color: '#4ECDC4',
                                            textDecoration: 'none',
                                            fontWeight: 'medium',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                color: '#26C6DA',
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        <OpenInNewIcon sx={{ fontSize: 18 }} />
                                        View Problem
                                    </Link>
                                ) : (
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                        No URL available
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        <Tooltip title="Delete Problem" arrow placement="left">
                            <Box
                                className="delete-button"
                                sx={{
                                    opacity: 0,
                                    transform: 'translateX(10px)',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <IconButton
                                    onClick={handleDeleteClick}
                                    sx={{
                                        color: '#ff6b6b',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            color: '#ff5252',
                                            background: 'linear-gradient(45deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 82, 82, 0.2) 100%)',
                                            transform: 'scale(1.1)',
                                        },
                                        '&:active': {
                                            transform: 'scale(0.95)',
                                        }
                                    }}
                                >
                                    <DeleteIcon sx={{ fontSize: 22 }} />
                                </IconButton>
                            </Box>
                        </Tooltip>
                    </Box>
                </CardContent>
            </Card>

            {/* Clean Time Tooltip */}
            <Popper
                open={timeTooltipOpen}
                anchorEl={anchorEl}
                placement="top"
                transition
                sx={{ zIndex: 2000 }}
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={200}>
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, rgba(33, 33, 33, 0.95) 0%, rgba(66, 66, 66, 0.95) 100%)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: 2,
                                p: 2.5,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                maxWidth: 300,
                                minWidth: 260,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <ScheduleIcon sx={{ fontSize: 20, color: '#4CAF50' }} />
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: '#4CAF50',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    Submission Time
                                </Typography>
                            </Box>

                            {/* Relative Time */}
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        mb: 0.5,
                                    }}
                                >
                                    {relativeTime}
                                </Typography>
                            </Box>

                            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />

                            {/* Date Information */}
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <CalendarIcon sx={{ fontSize: 16, color: '#64B5F6' }} />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#64B5F6',
                                            fontWeight: 'medium',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Date
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#fff',
                                        fontWeight: 'medium',
                                        ml: 2.5,
                                    }}
                                >
                                    {dateOnly}
                                </Typography>
                            </Box>

                            {/* Time Information */}
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <AccessTimeIcon sx={{ fontSize: 16, color: '#FFB74D' }} />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#FFB74D',
                                            fontWeight: 'medium',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        Time
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#fff',
                                        fontWeight: 'medium',
                                        ml: 2.5,
                                    }}
                                >
                                    {timeOnly}
                                </Typography>
                            </Box>
                        </Box>
                    </Fade>
                )}
            </Popper>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        background: 'rgba(26, 26, 46, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle sx={{ color: '#fff', fontWeight: 'bold' }}>
                    Delete Problem
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Are you sure you want to delete "{problem?.title || 'this problem'}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #d32f2f 30%, #c62828 90%)',
                            }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProblemCard;