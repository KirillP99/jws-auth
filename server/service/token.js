const jwt = require('jsonwebtoken');
const TokenModel = require('../models/token');

class TokenService {
    async generateTokens (payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS, { expiresIn: '30m' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH, { expiresIn: '30d' });

        return {
            accessToken,
            refreshToken,
        }
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS);
            return userData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH);
            return userData;
        } catch (e) {
            return null;
        }
    }

    async saveToken (userId, refreshToken) {
        const currentToken = await TokenModel.findOne({ user: userId });
        if (currentToken) {
            currentToken.refreshToken = refreshToken;
            return currentToken.save();
        }

        return await TokenModel.create({ user: userId, refreshToken });
    }

    async removeToken(refreshToken) {
        return await TokenModel.deleteOne({ refreshToken });
    }

    async findToken(refreshToken) {
        const tokenData = await TokenModel.findOne({refreshToken})
        return tokenData;
    }
}

module.exports = new TokenService();
