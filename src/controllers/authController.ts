 import { Request, Response } from 'express';
import User from '../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            res.status(200).json({ message: "please fill in all fields" });
            return;
        }

        const userExist = await User.findOne({ email });

        if (userExist) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                password: user.password, 
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: "server error" });
    }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Please provide email and password' });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const payload = {
            id: user._id,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: "1d",
        });

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: "server error" });
    }
};

const getProfile = (req: Request, res: Response): void => {
    res.status(200).json(req.user);
};

const instructorTest = (req: Request, res: Response): void => {
    res.status(200).json({ message: 'Welcome, Instructor!' });
};

export {
    registerUser,
    loginUser,
    getProfile,
    instructorTest,
};
