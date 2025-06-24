import jwt from 'jsonwebtoken';
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // Decode the expired token to get the username
        const decodedExpired = jwt.decode(token);
        return handleRefreshToken(req, res, next, decodedExpired);
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid access token format." });
      }
      console.error("Authentication error:", err);
      return res.status(500).json({ message: "Authentication failed." });
    }

    const user = await prisma.user.findUnique({
      where: { username: decoded.username },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        address: true,
        number: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid token. User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Unexpected authentication error:", err);
    res.status(500).json({ message: "Authentication failed due to an unexpected error." });
  }
};

async function handleRefreshToken(req, res, next, decodedAccess = null) {
  try {
    const username = decodedAccess?.username || null;
    if (!username) {
      return res.status(401).json({
        message: "Access token expired and username not found. Please login again."
      });
    }
    
    const foundUser = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        address: true,
        number: true,
        refreshToken: true
      }
    });

    if (!foundUser || !foundUser.refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found in database. Please login again."
      });
    }

    let decodedRefresh;
    try {
      decodedRefresh = jwt.verify(foundUser.refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      await prisma.user.update({
        where: { id: foundUser.id },
        data: { refreshToken: null },
      });
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Refresh token expired. Please login again." });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid refresh token format. Please login again." });
      }
      return res.status(500).json({ message: "Failed to refresh token. Please login again." });
    }

    if (foundUser.username !== decodedRefresh.username) {
      return res.status(403).json({ message: "Refresh token mismatch. Forbidden." });
    }

    req.user = foundUser;
    next();
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(500).json({ message: "Failed to refresh token. Please login again." });
  }
}

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Authentication required." 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Access denied. Insufficient permissions." 
      });
    }

    next();
  };
};

export const ensureOwnData = (req, res, next) => {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
        return res.status(403).json({ 
            message: "Access denied. You can only access your own data." 
        });
    }
    
    next();
};