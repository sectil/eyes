import { Request, Response } from 'express';

export interface AuthUser {
  userId: string;
  email: string;
}

export interface Context {
  req: Request;
  res: Response;
  user?: AuthUser;
}
