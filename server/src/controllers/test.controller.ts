import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TestService } from '../services/test.service';

export const resetDatabase = async (req: Request, res: Response): Promise<void> => {
  try {
    await TestService.resetDatabase();
    res.status(StatusCodes.OK).send();
  } catch(error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
}