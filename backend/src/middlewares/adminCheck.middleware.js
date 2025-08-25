import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Only admins can perform this action" });
        }

        req.user = decoded;
        next();
    });
};
