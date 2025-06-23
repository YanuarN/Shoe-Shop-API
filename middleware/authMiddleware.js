import jwt from 'jsonwebtoken';
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); 
      }
    }


    if (!token) {
      return res.status(401).json({ 
        message: "Access denied. No token provided." 
      });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
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
      return res.status(401).json({ 
        message: "Invalid token. User not found." 
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Authentication error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expired. Please login again." 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Invalid token format." 
      });
    } else {
      return res.status(500).json({ 
        message: "Authentication failed." 
      });
    }
  }
};

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