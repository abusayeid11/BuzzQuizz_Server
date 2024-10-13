import { Router } from "express";

import * as controller from "../controller/response.js";

const router = Router();
//Create Response
router.post("/", controller.submitResponse);

//Get Response by ID
router.get("/quiz/:id", controller.getResponsesbyQuizID);

//Get All Responses
router.get("/", controller.getAllResponses);

export default router;
