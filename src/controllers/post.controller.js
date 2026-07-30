import Posts from "../models/post.model.js";

class PostController {
  static async createPost(req, res, next) {
    try {
      const created = await Posts.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }

  static async getAllPosts(req, res, next) {
    try {
      const { term } = req.query;
      const posts = term ? await Posts.search(term) : await Posts.findAll();
      res.status(200).json(posts);
    } catch (error) {
      next(error);
    }
  }

  static async getPostById(req, res, next) {
    try {
      const post = await Posts.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post id must be real" });
      }
      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  }

  static async updatePost(req, res, next) {
    try {
      const postUpdate = await Posts.update(req.params.id, req.body);
      if (!postUpdate) {
        return res.status(404).json({ message: "Post can't be updated" });
      }
      res.status(200).json(postUpdate);
    } catch (error) {
      next(error);
    }
  }

  static async deletePost(req, res, next) {
    try {
      const postDelete = await Posts.remove(req.params.id);
      if (!postDelete) {
        return res.status(404).json({ message: "Post can't be deleted" });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default PostController;
