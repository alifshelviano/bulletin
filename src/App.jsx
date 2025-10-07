
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
    CssBaseline,
    Container,
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PostList from './components/PostList';
import PostDetails from './components/PostDetails';
import CreatePost from './components/CreatePost';
import EditPost from './components/EditPost';

const theme = createTheme({
    palette: {
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            <Button color="inherit" href="/">Bulletin Board</Button>
                        </Typography>
                        <Button color="inherit" href="/create">Create Post</Button>
                    </Toolbar>
                </AppBar>
                <Container>
                    <Box sx={{ my: 4 }}>
                        <Routes>
                            <Route path="/" element={<PostList />} />
                            <Route path="/posts/:id" element={<PostDetails />} />
                            <Route path="/create" element={<CreatePost />} />
                            <Route path="/edit/:id" element={<EditPost />} />
                        </Routes>
                    </Box>
                </Container>
            </Router>
        </ThemeProvider>
    );
}

export default App;
