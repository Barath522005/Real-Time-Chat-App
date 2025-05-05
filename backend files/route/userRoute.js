
import express from "express";
import { getOtherUsers, login, logout, register, getAllUsers, updateProfilePhoto } from "../controllers/usercontrol.js";
import isAuthenticated from "../middleware/authenticate.js";
import { upload } from "../utils/fileupload.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/").get(isAuthenticated,getOtherUsers);
router.route("/admin/users").get(getAllUsers);
router.route("/profile-photo").post(isAuthenticated, upload.single('file'), updateProfilePhoto);

export default router;
