import jwt from 'jsonwebtoken';
import { Student } from '../models/Student.model.js';
import { Faculty } from '../models/Faculty.model.js';
import { Hod } from '../models/Hod.model.js';
import { Admin } from '../models/Admin.model.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await Student.findById(decoded.id).select('-password') || 
                 await Faculty.findById(decoded.id).select('-password') || 
                 await Hod.findById(decoded.id).select('-password') || 
                 await Admin.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role ${req.user.role} is not authorized to access this route` });
    }
    
    // For faculty, check if approved
    if (req.user.role === 'faculty' && !req.user.isApproved) {
      return res.status(403).json({ message: 'Faculty account is pending HOD approval' });
    }
    next();
  };
};
