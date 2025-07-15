import { Router } from "express";
import { resetDatabase } from "../controllers/test.controller";

const router = Router();

router.post('/reset-database', resetDatabase);

export default router;