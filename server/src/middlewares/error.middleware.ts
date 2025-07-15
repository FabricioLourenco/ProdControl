import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// eslint=disable-next-line @typescript-eslint/no-used-vars
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Algo deu errado!' });
}