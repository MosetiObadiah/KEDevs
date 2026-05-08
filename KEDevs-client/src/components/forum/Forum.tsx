'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CommentItem from './CommentItem';
import { forumService } from '@/services/forumService';
import { useAuth } from '@/context/AuthContext';

interface ForumProps {
  jobId: string;
  initialComments: any[];
  onRefresh: () => void;
}

export default function Forum({ jobId, initialComments, onRefresh }: ForumProps) {
  const { isLoggedIn, user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const response = await forumService.postJobComment(jobId, newComment.trim());
      if (response.success) {
        setNewComment('');
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePostComment();
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
        Forum Discussion
      </Typography>

      {!isLoggedIn ? (
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          Sign in to join the discussion and see what other developers are saying about this role.
        </Alert>
      ) : (
        <Paper variant="outlined" sx={{ p: 2, mb: 4, borderRadius: 2, bgcolor: '#fcfcfc' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            {user?.fullName} (You)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Ask a question or share an insight... (Shift+Enter for new line)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="standard"
            slotProps={{ input: { disableUnderline: true } }}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="contained"
              endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              disabled={!newComment.trim() || submitting}
              onClick={handlePostComment}
              sx={{ borderRadius: 1.5, boxShadow: 0, px: 3 }}
            >
              Post
            </Button>
          </Box>
        </Paper>
      )}

      <Divider sx={{ mb: 4 }} />

      {initialComments.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No comments yet. Be the first to start the discussion!</Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {initialComments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              jobId={jobId} 
              onUpdate={onRefresh} 
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
