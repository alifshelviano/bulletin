
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Box
} from '@mui/material';
import PostCard from './PostCard';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/posts');
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

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

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Bulletin Board
            </Typography>
            <Grid container spacing={3}>
                {posts.map(post => (
                    <Grid item xs={12} key={post._id}>
                        <PostCard post={post} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default PostList;
