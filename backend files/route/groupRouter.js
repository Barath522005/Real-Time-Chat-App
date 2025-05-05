import express from "express";
import { createGroup, addMember, sendGroupMessage, getGroupMessages, getGroupById, getAllGroups, deleteGroupMessage } from "../controllers/groupController.js";
import isAuthenticated from "../middleware/authenticate.js";
import upload from "../middleware/fileupload.js";

const router = express.Router();

router.route("/create").post(isAuthenticated, createGroup);
router.route("/:groupId/add-member").post(isAuthenticated, addMember);
router.route("/:groupId/messages").get(isAuthenticated, getGroupMessages);
router.route("/:groupId/send-message").post(isAuthenticated, upload.single('file'), sendGroupMessage);
router.route("/:groupId/message/:messageId").delete(isAuthenticated, deleteGroupMessage);
router.route("/:groupId").get(isAuthenticated, getGroupById); // New route to fetch group by ID
router.route("/").get(isAuthenticated, getAllGroups); // New route to fetch all groups

export default router;