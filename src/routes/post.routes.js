import express from "express";
import PostController from "../controllers/post.controller.js";
import {
  validateCreatePost,
  validateUpdatePost,
} from "../middlewares/validatePost.js";

const router = express.Router();

router.post("/", validateCreatePost, PostController.createPost);
router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);
router.put("/:id", validateUpdatePost, PostController.updatePost);
router.delete("/:id", PostController.deletePost);

export default router;
