
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    TextField,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const CommentSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [author, setAuthor] = useState('');

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/posts/${postId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!text || !author) return;
        try {
            const response = await axios.post(`/api/posts/${postId}/comments`, { text, author });
            setComments([response.data, ...comments]);
            setText('');
            setAuthor('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await axios.delete(`/api/posts/${postId}/comments/${commentId}`);
            setComments(comments.filter(comment => comment._id !== response.data.deletedCommentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Comments
            </Typography>
            <Box component="form" onSubmit={handleAddComment} sx={{ mb: 2 }}>
                <TextField
                    label="Your Name"
                    variant="outlined"
                    fullWidth
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                    sx={{ mb: 1 }}
                />
                <TextField
                    label="Add a comment"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                />
                <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                    Submit
                </Button>
            </Box>
            <List>
                {comments.map((comment, index) => (
                    <React.Fragment key={comment._id}>
                        <ListItem
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteComment(comment._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText
                                primary={comment.text}
                                secondary={`— ${comment.author}, ${new Date(comment.createdAt).toLocaleString()}`}
                            />
                        </ListItem>
                        {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};

export default CommentSection;
