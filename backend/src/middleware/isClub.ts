import type { Response, NextFunction } from "express";
import type { CustomRequest } from "../types";

export function isClub(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    if (req.user.role !== "club") {
      res.status(403).json({ success: false, message: "Access forbidden. Club role required." });
      return;
    }

    next();
  } catch (error) {
    console.error("Role check error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
}
