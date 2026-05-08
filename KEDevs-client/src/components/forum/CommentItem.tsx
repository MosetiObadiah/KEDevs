'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  TextField,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FlagIcon from '@mui/icons-material/Flag';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { forumService } from '@/services/forumService';

interface CommentProps {
  comment: any;
  jobId: string;
  onUpdate: () => void;
  isReply?: boolean;
}

export default function CommentItem({ comment, jobId, onUpdate, isReply = false }: CommentProps) {
  const { user, isLoggedIn } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [submitting, setSubmitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isAuthor = user?.id === comment.authorId;
  const canEdit = isAuthor && (new Date().getTime() - new Date(comment.createdAt).getTime()) < 15 * 60 * 1000;
  const canDelete = isAuthor && (new Date().getTime() - new Date(comment.createdAt).getTime()) < 60 * 60 * 1000;

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!isLoggedIn) return;
    try {
      await forumService.voteComment(comment.id, type);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to vote');
    }
  };

  const handlePostReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await forumService.replyToComment(jobId, comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setSubmitting(true);
    try {
      await forumService.editComment(comment.id, editContent.trim());
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to edit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await forumService.deleteComment(comment.id);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  const handleFlag = async () => {
    const reason = prompt('Reason for flagging:');
    if (!reason) return;
    try {
      await forumService.flagComment(comment.id, reason);
      alert('Comment flagged.');
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to flag comment');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  return (
    <Box sx={{ mb: 2, ml: isReply ? 4 : 0, borderLeft: isReply ? '2px solid #edeff1' : 'none', pl: isReply ? 2 : 0 }}>
      <Stack direction="row" spacing={1}>
        {/* Voting Pillar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, pt: 0.5 }}>
          <IconButton 
            size="small" 
            onClick={() => handleVote('UPVOTE')}
            color={comment.currentUserVote === 'UPVOTE' ? 'primary' : 'default'}
            disabled={isAuthor || !isLoggedIn}
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ fontWeight: 800, py: 0.2 }}>
            {comment.upvoteCount}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => handleVote('DOWNVOTE')}
            color={comment.currentUserVote === 'DOWNVOTE' ? 'secondary' : 'default'}
            disabled={isAuthor || !isLoggedIn}
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {comment.authorName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • {formatDistanceToNow(new Date(comment.createdAt))} ago
            </Typography>
            {comment.isFlagged && (
              <Tooltip title="This comment has been flagged">
                <FlagIcon sx={{ fontSize: 14, color: 'error.main' }} />
              </Tooltip>
            )}
          </Stack>

          {isEditing ? (
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                multiline
                size="small"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleSaveEdit)}
                autoFocus
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" variant="contained" onClick={handleSaveEdit} disabled={submitting}>Save</Button>
                <Button size="small" onClick={() => setIsEditing(false)}>Cancel</Button>
              </Stack>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: comment.authorId === null ? 'text.secondary' : 'text.primary', fontStyle: comment.authorId === null ? 'italic' : 'normal' }}>
              {comment.content}
            </Typography>
          )}

          {/* Action Row */}
          <Stack direction="row" spacing={2} sx={{ mt: 1, ml: -1 }}>
            {!isReply && isLoggedIn && comment.authorId !== null && (
              <Button 
                size="small" 
                startIcon={<ChatBubbleOutlinedIcon fontSize="small" />} 
                onClick={() => setIsReplying(!isReplying)}
                sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 700 }}
              >
                Reply
              </Button>
            )}
            {isLoggedIn && (
              <>
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                  {canEdit && (
                    <MenuItem onClick={() => { setIsEditing(true); setAnchorEl(null); }}>
                      <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Edit</ListItemText>
                    </MenuItem>
                  )}
                  {canDelete && (
                    <MenuItem onClick={() => { handleDelete(); setAnchorEl(null); }} sx={{ color: 'error.main' }}>
                      <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                      <ListItemText>Delete</ListItemText>
                    </MenuItem>
                  )}
                  {!isAuthor && (
                    <MenuItem onClick={() => { handleFlag(); setAnchorEl(null); }}>
                      <ListItemIcon><FlagIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Report</ListItemText>
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Stack>

          {isReplying && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <TextField
                fullWidth
                multiline
                placeholder="What are your thoughts?"
                size="small"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handlePostReply)}
                autoFocus
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" variant="contained" onClick={handlePostReply} disabled={submitting}>Reply</Button>
                <Button size="small" onClick={() => setIsReplying(false)}>Cancel</Button>
              </Stack>
            </Box>
          )}

          {/* Render Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {comment.replies.map((reply: any) => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  jobId={jobId} 
                  onUpdate={onUpdate} 
                  isReply={true} 
                />
              ))}
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
