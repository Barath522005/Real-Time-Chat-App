
import express from "express";
import { getMessage, sendMessage, deleteMessage } from "../controllers/msgcontrol.js";
import isAuthenticated from "../middleware/authenticate.js";
import { upload } from "../utils/fileupload.js";

const router = express.Router();

router.route("/send/:id").post(isAuthenticated, upload.single('file'), sendMessage);
router.route("/:id").get(isAuthenticated, getMessage);
router.route("/:messageId").delete(isAuthenticated, deleteMessage);

export default router;
