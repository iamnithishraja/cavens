import type { Response, NextFunction } from "express";
import type { CustomRequest } from "../types";

export function isAdmin(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({ success: false, message: "Admin access required" });
      return;
    }

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


