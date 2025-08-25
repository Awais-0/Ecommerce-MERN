import jwt from 'jsonwebtoken';

const authCheck = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];
    // console.log(req.cookies.accessToken)
    if (!token) {
        console.error("Unauthorized access attempt, no token provided");
        return res.status(401).json({ message: "Unauthorized, No accessToken" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({ message: "Invalid access token" });
        }
        req.user = decodedUser;
        next();
    });
};

export default authCheck;