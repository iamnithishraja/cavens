import type { IUser } from "./user";
import type { Request } from "express";

export type CustomRequest = Request & {
    user?: IUser;  
};   

  