class PostValidator {
  static validateCreate(postData) {
    const errors = [];

    if (
      !postData.title ||
      typeof postData.title !== "string" ||
      postData.title.trim() === ""
    ) {
      errors.push("The title is required and must be valid text.");
    }

    if (
      !postData.content ||
      typeof postData.content !== "string" ||
      postData.content.trim() === ""
    ) {
      errors.push("This field is required and must contain valid text");
    }

    if (
      !postData.category ||
      typeof postData.category !== "string" ||
      postData.category.trim() === ""
    ) {
      errors.push("The category is required and must be valid text");
    }

    if (postData.tags !== undefined && postData.tags !== null) {
      if (!Array.isArray(postData.tags)) {
        errors.push("The tags must be an array");
      } else if (postData.tags.length > 0) {
        const invalidTags = postData.tags.filter(
          (tag) => typeof tag !== "string",
        );
        if (invalidTags.length > 0) {
          errors.push("Each label must be a string.");
        }
      }
    }

    return errors;
  }

  static validateUpdate(postData) {
    const errors = [];

    if (!postData || Object.keys(postData).length === 0) {
      errors.push("El cuerpo de la solicitud no puede estar vacío");
      return errors;
    }

    if (postData.title !== undefined) {
      if (typeof postData.title !== "string" || postData.title.trim() === "") {
        errors.push("El título debe ser un texto válido no vacío");
      }
    }

    if (postData.content !== undefined) {
      if (
        typeof postData.content !== "string" ||
        postData.content.trim() === ""
      ) {
        errors.push("El contenido debe ser un texto válido no vacío");
      }
    }

    if (postData.category !== undefined) {
      if (
        typeof postData.category !== "string" ||
        postData.category.trim() === ""
      ) {
        errors.push("La categoría debe ser un texto válido no vacío");
      }
    }

    if (postData.tags !== undefined) {
      if (postData.tags === null) {
        errors.push("Las etiquetas no pueden ser null");
      } else if (!Array.isArray(postData.tags)) {
        errors.push("Las etiquetas deben ser un array");
      } else if (postData.tags.length > 0) {
        const invalidTags = postData.tags.filter(
          (tag) => typeof tag !== "string",
        );
        if (invalidTags.length > 0) {
          errors.push("Cada etiqueta debe ser un texto (string)");
        }
      }
    }

    return errors;
  }
}

function validateCreatePost(req, res, next) {
  const errors = PostValidator.validateCreate(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

function validateUpdatePost(req, res, next) {
  const errors = PostValidator.validateUpdate(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

export { validateCreatePost, validateUpdatePost };
