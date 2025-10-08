
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://filbertleo88_db_user:bert88@cluster0.rpud4rs.mongodb.net/bulletin-board", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

import { OAuth2Client } from "google-auth-library";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user
        let user = await User.findOne({
          $or: [{ email: profile.emails[0].value }, { googleId: profile.id }],
        });

        if (!user) {
          // Create username from Google profile
          const baseUsername = profile.displayName.toLowerCase().replace(/\s+/g, "");
          let username = baseUsername;
          let counter = 1;

          // Ensure username is unique
          while (await User.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          user = new User({
            email: profile.emails[0].value,
            username,
            googleId: profile.id,
            profilePicture: profile.photos[0].value,
            isVerified: true,
          });

          await user.save();
        } else if (!user.googleId) {
          // Link Google account to existing email
          user.googleId = profile.id;
          user.profilePicture = profile.photos[0].value || user.profilePicture;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Initialize passport
app.use(passport.initialize());

// Google OAuth Routes
app.get(
  "/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get("/api/auth/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  // Generate JWT token
  const token = jwt.sign(
    {
      id: req.user._id,
      email: req.user.email,
      username: req.user.username,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5001"}/auth/success?token=${token}`);
});

// Alternative: Verify Google token from frontend (for popup flows)
app.post("/api/auth/google/token", async (req, res) => {
  const { token: googleToken } = req.body;

  try {
    if (!googleToken) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { googleId: googleId }],
    });

    if (!user) {
      // Create username from Google name
      const baseUsername = name.toLowerCase().replace(/\s+/g, "");
      let username = baseUsername;
      let counter = 1;

      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = new User({
        email: email.toLowerCase(),
        username,
        googleId,
        profilePicture: picture,
        isVerified: true,
      });

      await user.save();
    } else {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture || user.profilePicture;
        await user.save();
      }
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Google authentication successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(400).json({ message: "Invalid Google token" });
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password required only for non-Google users
    },
    minlength: 6,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

// Post Schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 10,
  },
  content: {
    type: String,
    required: true,
    minlength: 20,
  },
  author: {
    type: String,
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      text: String,
      author: String,
      authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Post = mongoose.model("Post", postSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Authentication Routes
// Register with Email, Username, and Password
app.post("/api/auth/register", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({ message: "Email, username, and password are required" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      username,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      {
        id: savedUser._id,
        email: savedUser.email,
        username: savedUser.username,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        username: savedUser.username,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    res.status(500).json({ message: "Error creating user" });
  }
});

// Login with Email and Password
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user has a password (Google users might not have passwords)
    if (!user.password) {
      return res.status(400).json({ message: "Please use Google to sign in or reset your password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error during login" });
  }
});

// Google Authentication Route (Placeholder - You'll need to implement OAuth2)
app.post("/api/auth/google", async (req, res) => {
  const { googleToken } = req.body;

  try {
    // This is a placeholder - you'll need to implement proper Google OAuth2 verification
    // For now, we'll assume the frontend has verified the token and sends user info

    const { email, name, picture, sub: googleId } = req.body; // From verified Google token

    if (!email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    // Find user by email or googleId
    let user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { googleId: googleId }],
    });

    if (!user) {
      // Create new user for Google authentication
      const username = name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);

      user = new User({
        email: email.toLowerCase(),
        username,
        googleId,
        profilePicture: picture,
        isVerified: true,
      });

      await user.save();
    } else {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture || user.profilePicture;
        await user.save();
      }
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Google authentication successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Error during Google authentication" });
  }
});

app.get("/auth/success", (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  // Option 1: Redirect to your frontend dashboard (recommended)
  res.redirect(`http://localhost:5173?token=${token}`);

  // Option 2: Just return success JSON
  // res.status(200).json({ message: 'Login successful', token });
});

// Get current user profile
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if email exists
app.post("/api/auth/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        exists: false,
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
        exists: false,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    res.json({
      exists: !!user,
      message: user ? "Email already registered" : "Email available",
    });
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({
      message: "Error checking email",
      exists: false,
    });
  }
});

// Check if username exists
app.post("/api/auth/check-username", async (req, res) => {
  try {
    const { username } = req.body;

    // Check if username is provided
    if (!username) {
      return res.status(400).json({
        message: "Username is required",
        exists: false,
      });
    }

    // Validate username length
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        message: "Username must be between 3 and 30 characters",
        exists: false,
      });
    }

    const user = await User.findOne({ username });
    res.json({
      exists: !!user,
      message: user ? "Username already taken" : "Username available",
    });
  } catch (error) {
    console.error("Check username error:", error);
    res.status(500).json({
      message: "Error checking username",
      exists: false,
    });
  }
});

// API Routes (Protected)
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("authorId", "username");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/posts", authenticateToken, async (req, res) => {
  const { title, content } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = new Post({
      title,
      content,
      author: user.username,
      authorId: user._id,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("authorId", "username");
    if (post == null) {
      return res.status(404).json({ message: "Cannot find post" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/posts/:id", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Cannot find post" });
    }

    // Check if user is the author
    if (post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true });
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Cannot find post" });
    }

    // Check if user is the author
    if (post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Comment Routes
app.post("/api/posts/:id/comments", authenticateToken, async (req, res) => {
  const { text } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Cannot find post" });
    }

    const newComment = {
      text,
      author: user.username,
      authorId: user._id,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const createdComment = post.comments[post.comments.length - 1];
    res.status(201).json(createdComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/posts/:id/comments/:commentId", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Cannot find post" });
    }

    const commentId = req.params.commentId;
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Cannot find comment" });
    }

    // Check if user is the comment author
    if (comment.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    post.comments.pull(commentId);
    await post.save();
    res.json({ deletedCommentId: commentId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's posts
app.get("/api/users/:userId/posts", authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find({ authorId: req.params.userId });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});