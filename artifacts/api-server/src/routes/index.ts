import { Router, type IRouter } from "express";
import bizQuestAuthRouter from "./bizquest-auth";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bizQuestAuthRouter);

export default router;
