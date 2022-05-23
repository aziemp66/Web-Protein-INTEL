const bcrypt = require("bcrypt");

const validation = require("../utility/validation");

const generateToken = require("../utility/generate-token");

const User = require("../models/user.model");

const userRegister = async(req, res, next) => {
    const { nim, password, confirmPassword, name, email } = req.body;

    if (isNaN(nim)) {
        return next(new Error("NIM must be a number"));
    }

    //check if password and confirmPassword are the same
    if (password !== confirmPassword) {
        return next(
            new Error("Password and Confirm Password are not the same")
        );
    }

    const { error } = validation.registerValidation({
        nim,
        password,
        name,
        email,
    });
    if (error) return next(error.details[0].message);

    let existingUserByNim;
    try {
        existingUserByNim = await User.findOne({ nim });
    } catch (error) {
        return next(error);
    }
    if (existingUserByNim) return next(new Error("User already exists"));

    let existingUserByEmail;
    try {
        existingUserByEmail = await User.findOne({ email });
    } catch (error) {
        return next(error);
    }
    if (existingUserByEmail) return next(new Error("Email already exists"));

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
        nim,
        password: hashedPassword,
        name,
        email,
    });

    try {
        await user.save();
        res.json({ message: "User created successfully" });
    } catch (err) {
        return next(err);
    }
};

const userLogin = async(req, res, next) => {
    const { email, password } = req.body;

    const { error } = validation.loginValidation({
        email,
        password,
    });
    if (error) return next(error.details[0].message);

    let user;
    try {
        user = await User.findOne({ email });
    } catch (err) {
        return next(err);
    }
    if (!user) return next(new Error("User not found"));

    let isMatch;
    try {
        isMatch = await bcrypt.compare(password, user.password);
    } catch (error) {
        return next(error);
    }
    if (!isMatch) return next(new Error("Password is incorrect"));

    const token = generateToken({
        nim: user.nim,
        role: "user",
    });

    res.json({
        message: "User logged in successfully",
        token,
    });
};

const adminLogin = (req, res, next) => {
    const { username, password } = req.body;

    if (username !== "admin" || password !== "HarusRandombiargakbocor007") {
        return next(new Error("Username or Password is incorrect"));
    }

    const token = generateToken({
        role: "admin",
    });

    res.json({
        message: "Admin Successfully Logged In",
        token,
    });
};

module.exports = {
    register: userRegister,
    login: userLogin,
    admin: adminLogin,
};