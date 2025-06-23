import jwt from 'jsonwebtoken';

export const generateToken = (user, res) => {
    const token = jwt.sign(
        {
            username: user.username,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '10d'
        }
    );
        
    if (res) {
        res.cookie('token', token, {
            httpOnly: true,  
            sameSite: 'strict',    
            maxAge: 10 * 24 * 60 * 60 * 1000, 
     });
    }
    return token;
};