import jwt from 'jsonwebtoken';

export const signToken = (user) =>
  jwt.sign({ userId: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
