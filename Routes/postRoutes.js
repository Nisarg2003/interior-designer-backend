import express from "express";

import multer from "multer";
import {
  createPost,
  deletePost,
  editPost,
  findPostByCategoty,
  findPostById,
  getCategories,
  getPost,
} from "../Controller/postController.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post(
  "/createPost",
  upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "photos" }]),
  createPost
);

router.get("/getAllPost", getPost);
router.post("/postByCategory", findPostByCategoty);
router.get("/postById/:id", findPostById);
router.get("/getCategories", getCategories);
router.put(
  "/editPost/:id",
  upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "photos" }]),
  editPost
);
router.delete("/deletePost/:id", deletePost);

export default router;
