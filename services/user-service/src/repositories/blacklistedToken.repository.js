import { BlacklistedToken } from '../models/index.js';

class BlacklistedTokenRepository {
    async addTokenAsync(token) {
        return await BlacklistedToken.create({ token });
    }

    async isTokenBlacklistedAsync(token) {
        return await BlacklistedToken.findOne({ token });
    }

    async deleteExpiredTokensAsync() {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() - 1);
        return await BlacklistedToken.deleteMany({
            createdAt: { $lt: expiryDate },
        });
    }
}

export default BlacklistedTokenRepository;
