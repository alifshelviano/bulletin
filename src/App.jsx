
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CssBaseline, Container, AppBar, Toolbar, Typography, Button, Box, Modal, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Alert, IconButton, InputAdornment } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { Visibility, VisibilityOff, Close } from "@mui/icons-material";
import PostList from "./components/PostList";
import PostDetails from "./components/PostDetails";
import CreatePost from "./components/CreatePost";
import EditPost from "./components/EditPost";

const theme = createTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
  },
});

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleAuthModalOpen = () => {
    setAuthModalOpen(true);
    setErrors({});
    setFormData({
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    setErrors({});
    setFormData({
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setErrors({});
    setFormData({
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateRegisterForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const validateLoginForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = validateRegisterForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        setUser(data.user);
        handleAuthModalClose();
        setErrors({ success: "Registration successful!" });
      } else {
        setErrors({ submit: data.message || "Registration failed" });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = validateLoginForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        setUser(data.user);
        handleAuthModalClose();
        setErrors({ success: "Login successful!" });
      } else {
        setErrors({ submit: data.message || "Login failed" });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5001/api/auth/google";
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    console.log("Forgot password clicked");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Button color="inherit" href="/">
                Bulletin Board
              </Button>
            </Typography>

            {isLoggedIn ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1">Welcome, {user?.username}</Typography>
                <Button color="inherit" href="/create">
                  Create Post
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button color="inherit" href="/create">
                  Create Post
                </Button>
                <Button color="inherit" onClick={handleAuthModalOpen}>
                  Login / Register
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Container>
          <Box sx={{ my: 4 }}>
            {/* Success Alert */}
            {errors.success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {errors.success}
              </Alert>
            )}

            <Routes>
              <Route path="/" element={<PostList />} />
              <Route path="/posts/:id" element={<PostDetails />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/edit/:id" element={<EditPost />} />
            </Routes>
          </Box>
        </Container>

        {/* Authentication Modal */}
        <Dialog open={authModalOpen} onClose={handleAuthModalClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {activeTab === 0 ? "Login" : "Register"}
              <IconButton onClick={handleAuthModalClose}>
                <Close />
              </IconButton>
            </Box>
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>
          </DialogTitle>

          <DialogContent>
            {/* Error Alert */}
            {errors.submit && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.submit}
              </Alert>
            )}

            {activeTab === 0 ? (
              // Login Form
              <Box component="form" sx={{ mt: 2 }}>
                <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} error={!!errors.email} helperText={errors.email} margin="normal" />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={handleGoogleLogin}>
                  Sign in with Google
                </Button>
              </Box>
            ) : (
              // Register Form
              <Box component="form" sx={{ mt: 2 }}>
                <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} error={!!errors.email} helperText={errors.email} margin="normal" />
                <TextField fullWidth label="Username" name="username" value={formData.username} onChange={handleInputChange} error={!!errors.username} helperText={errors.username} margin="normal" />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={handleGoogleLogin}>
                  Sign up with Google
                </Button>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ flexDirection: "column", gap: 1, p: 3 }}>
            {activeTab === 0 ? (
              // Login Actions
              <>
                <Button fullWidth variant="contained" onClick={handleLogin} size="large">
                  Login
                </Button>
                <Button color="primary" onClick={handleForgotPassword} sx={{ alignSelf: "center" }}>
                  Forgot Password?
                </Button>
              </>
            ) : (
              // Register Actions
              <Button fullWidth variant="contained" onClick={handleRegister} size="large">
                Register
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Router>
    </ThemeProvider>
  );
}

export default App;