const UserModel = require('../models/user');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const mailService = require('./mail');
const tokenService = require('../service/token');
const UserDto = require('../dto/user');
const ApiErrors = require('../exceprions/api-errors');

class UserService {
    async registration (email, password) {
        const candidate = await UserModel.findOne({ email });

        if (candidate) {
            throw ApiErrors.BadRequest('user with this email already exists');
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();

        const user = await UserModel.create({ email, password: hashPassword, activationLink });
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user);
        const tokens = await tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        };
    }

    async activate (activationLink) {
        const user = await UserModel.findOne({ activationLink });

        if (!activationLink) {
            throw ApiErrors.BadRequest('user not exist');
        }

        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})
        if (!user) {
            throw ApiErrors.BadRequest('User not found')
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiErrors.BadRequest('Incorrect password');
        }
        const userDto = new UserDto(user);
        const tokens = await tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        return await tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiErrors.UnauthorizedError();
        }
        const userData = await tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiErrors.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = await tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async getAllUsers() {
        return await UserModel.find();
    }
}

module.exports = new UserService();
