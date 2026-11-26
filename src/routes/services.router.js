import { Router } from "express";
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../controllers/services.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createServiceSchema,
  updateServiceSchema,
  getServicesQuerySchema,
} from "../validators/services.validator.js";

const router = Router();

router.get("/", validate(getServicesQuerySchema, "query"), getServices);
router.get("/:sid", getServiceById);
router.post("/", validate(createServiceSchema), createService);
router.put("/:sid", validate(updateServiceSchema), updateService);
router.delete("/:sid", deleteService);

export default router;