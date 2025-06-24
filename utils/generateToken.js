import jwt from 'jsonwebtoken';

export const generateAccessToken = (user, res) => {
    const accessToken = jwt.sign(
        {
            username: user.username,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: '5m'
        }
    );
        
    if (res) {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 30 * 60 * 1000,
        });
    }
    return accessToken;
};

export const generateRefreshToken = (user, res) => {
    const refreshToken = jwt.sign(
        {
            username: user.username,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: '15d'
        }
    );
    return refreshToken
}