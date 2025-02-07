import jwt from "jsonwebtoken";

class JWTHelper {
    static createJWT(info, secret, expiration) {
        return jwt.sign(info, secret, { expiresIn: expiration });
    }

    static verifyJWT(token, secret) {
        return jwt.verify(token, secret);
    }
}

export default JWTHelper;
