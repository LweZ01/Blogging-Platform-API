import supabase from "../config/supabaseClient.js";

class Posts {
  static formatPost(post) {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags ? post.tags.map((t) => t.tags).filter(Boolean) : [],
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    };
  }

  static async create(postData) {
    const { data: newPost, error } = await supabase
      .rpc("create_post_with_tags", {
        p_title: postData.title,
        p_content: postData.content,
        p_category: postData.category,
        p_tags: postData.tags || [],
      })
      .single();

    Validator.checkDbError(error);

    const postWithTags = await this.findById(newPost.id);
    return postWithTags;
  }

  static async findAll() {
    const { data: posts, error } = await supabase.from("posts").select(`
      *,
      tags:post_tags(
        tags(
          id,
          name
        )
      )
    `);

    Validator.checkDbError(error);

    return (posts || []).map((post) => this.formatPost(post));
  }

  static async findById(id) {
    const { data: post, error } = await supabase
      .from("posts")
      .select(
        `
      *,
      tags:post_tags(
        tags(
          id,
          name
        )
      )
    `,
      )
      .eq("id", id)
      .maybeSingle();

    Validator.checkDbError(error);

    if (!post) return null;

    return this.formatPost(post);
  }

  static async update(id, postData) {
    const existingPost = await this.findById(id);
    if (!existingPost) {
      return null;
    }

    const { error } = await supabase
      .rpc("update_post_with_tags", {
        p_post_id: id,
        p_title: postData.title,
        p_content: postData.content,
        p_category: postData.category,
        p_tags: postData.tags === undefined ? null : postData.tags,
        p_updated_at: new Date().toISOString(),
      })
      .single();

    Validator.checkDbError(error);

    const updatedPost = await this.findById(id);
    return updatedPost;
  }

  static async remove(id) {
    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .select();

    Validator.checkDbError(error);

    if (!data || data.length === 0) {
      return null;
    }

    return true;
  }

  static async search(term) {
    if (!term || term.trim() === "") {
      return this.findAll();
    }

    const { data: posts, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        tags:post_tags(
          tags(
            id,
            name
          )
        )
      `,
      )
      .or(
        `title.ilike.%${term}%,content.ilike.%${term}%,category.ilike.%${term}%`,
      );

    Validator.checkDbError(error);

    return (posts || []).map((post) => this.formatPost(post));
  }
}

class Validator {
  static checkDbError(error) {
    if (error) {
      throw new Error(`[Database Error] ${error.message || error}`);
    }
  }

  static validatePostData(postData) {
    if (!postData) {
      throw new Error(
        "[Validation Error] The information in this post is required.",
      );
    }
    if (!postData.title || postData.title.trim() === "") {
      throw new Error("[Validation Error] The title is required.");
    }
  }
}

export default Posts;
