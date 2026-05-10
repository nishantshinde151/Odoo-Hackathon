import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tripsRouter from "./trips";
import stopsRouter from "./stops";
import activitiesRouter from "./activities";
import citiesRouter from "./cities";
import budgetRouter from "./budget";
import packingRouter from "./packing";
import notesRouter from "./notes";
import profileRouter from "./profile";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tripsRouter);
router.use(stopsRouter);
router.use(activitiesRouter);
router.use(citiesRouter);
router.use(budgetRouter);
router.use(packingRouter);
router.use(notesRouter);
router.use(profileRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;
