import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/Users.js";
import jwt from "jsonwebtoken";

export async function signin(req, res) {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email or password is invalid" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email or password is invalid" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Email or password is invalid" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "User signed in successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

export async function signup(req, res) {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !email && "email",
          !password && "password",
        ].filter(Boolean),
      });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const random = Math.floor(Math.random() * 100) + 1;
    const profilePic = `https://avatar.iran.liara.run/public/${random}`;

    const newUser = await User.create({
      fullName,
      email,
      password,
      profilePic,
    });

    await upsertStreamUser({
      id: newUser._id.toString(),
      name: fullName,
      image: profilePic,
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.log("Error while creating an user", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

export async function signout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ message: "User signed out successfully" });
}

export async function onboard(req, res) {
  const userId = req.user._id;

  const { fullName, bio, nativeLanguage, learningLanguage, location } =
    req.body || {};

  if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
    return res.status(400).json({
      message: "All fields are required",
      missingFields: [
        !fullName && "fullName",
        !bio && "bio",
        !nativeLanguage && "nativeLanguage",
        !learningLanguage && "learningLanguage",
        !location && "location",
      ].filter(Boolean),
    });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullName,
      image: updatedUser.profilePic,
    });
    res
      .status(200)
      .json({ message: "User onboarded successfully", updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", error });
  }
}
