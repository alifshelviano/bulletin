
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Collapse,
    IconButton,
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import CommentSection from './CommentSection';

const PostCard = ({ post }) => {
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    {post.title}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    by {post.author}
                </Typography>
                <Typography variant="body2">
                    {post.content}
                </Typography>
            </CardContent>
            <CardActions disableSpacing>
                <Button size="small" component={Link} to={`/posts/${post._id}`}>
                    View Details
                </Button>
                <IconButton
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show comments"
                    sx={{ marginLeft: 'auto' }}
                >
                    <CommentIcon />
                </IconButton>
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <CommentSection postId={post._id} />
                </CardContent>
            </Collapse>
        </Card>
    );
};

export default PostCard;
