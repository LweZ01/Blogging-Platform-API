import supabase from "../config/supabaseClient.js";

class Posts {
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
    return newPost;
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

    return (posts || []).map((post) => ({
      ...post,
      tags: post.tags ? post.tags.map((t) => t.tags).filter(Boolean) : [],
    }));
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

    return {
      ...post,
      tags: post.tags ? post.tags.map((t) => t.tags).filter(Boolean) : [],
    };
  }

  static async update(id, postData) {
    const existingPost = await this.findById(id);
    if (!existingPost) {
      return null;
    }

    const { data: updatedPost, error } = await supabase
      .rpc("update_post_with_tags", {
        p_post_id: id,
        p_title: postData.title,
        p_content: postData.content,
        p_category: postData.category,
        p_tags: postData.tags || [],
        p_updated_at: new Date().toISOString(),
      })
      .single();

    Validator.checkDbError(error);
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

    return (posts || []).map((post) => ({
      ...post,
      tags: post.tags ? post.tags.map((t) => t.tags).filter(Boolean) : [],
    }));
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
      throw new Error("[Validation Error] Los datos del post son requeridos.");
    }
    if (!postData.title || postData.title.trim() === "") {
      throw new Error("[Validation Error] El título es obligatorio.");
    }
  }
}

export default Posts;
