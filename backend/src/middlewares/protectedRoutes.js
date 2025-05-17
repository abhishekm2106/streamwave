import jwt from "jsonwebtoken";
import User from "../models/Users.js";

export default async function protectedRoutes(req, res, next) {
  try {
    let token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized, user does not exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth protected route error: ", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
