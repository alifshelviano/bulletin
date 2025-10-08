
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Box,
} from '@mui/material';
import CommentSection from '../components/CommentSection';

const PostDetailPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`/api/posts/${id}`);
                setPost(response.data);
            } catch (error) {
                setError('Post not found or an error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!post) {
        return <Alert severity="info">No post to display.</Alert>;
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {post.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    By {post.author} on {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" paragraph>
                    {post.content}
                </Typography>
            </Paper>
            <CommentSection postId={id} />
        </Container>
    );
};

export default PostDetailPage;
