# Blogging Platform API

A RESTful API for a personal blogging platform, with full CRUD operations on posts, categories, and tags, plus search by term. Built as a practice project to reinforce MVC architecture concepts, database normalization, and REST API design best practices.

## Stack

- **Node.js** + **Express** — server and routing
- **Supabase** (**PostgreSQL**) — database
- **MVC architecture** — separation into config / models / controllers / routes / middlewares

## Project structure

```
blog-api/
│
├── src/
│   ├── config/
│   │   └── supabaseClient.js       # Supabase client connection
│   │
│   ├── models/
│   │   └── post.model.js           # Data access (queries and RPC calls to Supabase)
│   │
│   ├── controllers/
│   │   └── post.controller.js      # Business logic and HTTP responses
│   │
│   ├── routes/
│   │   └── post.routes.js          # Endpoint definitions
│   │
│   ├── middlewares/
│   │   ├── validatePost.js         # Request body validation (create/update)
│   │   └── errorHandler.js         # Centralized error handling
│   │
│   └── app.js                      # Express configuration
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── server.js                       # Entry point
```

## Request flow

```
Client (Postman/Thunder Client/browser)
      │
      ▼
routes/post.routes.js          → maps HTTP method + URL to the controller
      │
      ▼
middlewares/validatePost.js    → validates the request body (POST/PUT only)
      │
      ▼
controllers/post.controller.js → orchestrates the request and builds the HTTP response
      │
      ▼
models/post.model.js           → runs queries/RPC calls against Supabase
      │
      ▼
config/supabaseClient.js       → configured client used by the model
```

Errors thrown at any point in this chain are caught and forwarded to `middlewares/errorHandler.js`, mounted at the end of `app.js`.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd blog-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a project on [Supabase](https://supabase.com) and run the SQL from the [Database schema](#database-schema) section in the SQL Editor.

4. Copy `.env.example` to `.env` and fill in your Supabase credentials:

   ```
   PORT=3000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   ```

5. Start the server:

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`.

## Database schema

Normalized design in 3NF: posts, categories, and tags live in separate tables, with `post_tags` as a pivot table for the many-to-many relationship between posts and tags.

```sql
-- Extension for efficient wildcard search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Main posts table
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tags table
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- post_tags pivot table (many-to-many relationship)
CREATE TABLE post_tags (
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Indexes for wildcard search (ILIKE '%term%')
CREATE INDEX idx_posts_title_trgm ON posts USING GIN (title gin_trgm_ops);
CREATE INDEX idx_posts_content_trgm ON posts USING GIN (content gin_trgm_ops);
CREATE INDEX idx_posts_category_trgm ON posts USING GIN (category gin_trgm_ops);

-- Indexes on the pivot table's foreign keys
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);
```

Additionally, creating and updating posts (including tag synchronization) is handled through PostgreSQL functions (`create_post_with_tags`, `update_post_with_tags`) to guarantee atomicity — if any step fails, the entire operation is rolled back.

> **Note on Row Level Security (RLS):** if your Supabase project creates tables with RLS enabled by default, you'll need to disable it for these tables or define access policies, since this project does not implement authentication:
>
> ```sql
> ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
> ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
> ALTER TABLE post_tags DISABLE ROW LEVEL SECURITY;
> ```

## Endpoints

All responses use `Content-Type: application/json`. Date fields (`createdAt`, `updatedAt`) are returned in ISO 8601 format.

### Create a post

```
POST /posts
```

**Body:**

```json
{
  "title": "My First Blog Post",
  "content": "This is the content of my first blog post.",
  "category": "Technology",
  "tags": ["Node.js", "Express"]
}
```

`tags` is optional. `title`, `content`, and `category` are required.

**Response `201 Created`:**

```json
{
  "id": 1,
  "title": "My First Blog Post",
  "content": "This is the content of my first blog post.",
  "category": "Technology",
  "tags": [
    { "id": 1, "name": "Node.js" },
    { "id": 2, "name": "Express" }
  ],
  "createdAt": "2026-07-30T12:00:00Z",
  "updatedAt": "2026-07-30T12:00:00Z"
}
```

**Response `400 Bad Request`** if a required field is missing or has an invalid type:

```json
{
  "errors": ["Title is required and must be valid text"]
}
```

### Get all posts

```
GET /posts
```

**Response `200 OK`:** array of posts, in the same shape as the creation example.

### Search posts by term

```
GET /posts?term=tech
```

Performs a case-insensitive partial match search across `title`, `content`, and `category`.

**Response `200 OK`:** array of matching posts (empty `[]` if there are no results).

### Get a post by ID

```
GET /posts/:id
```

**Response `200 OK`:** the requested post.

**Response `404 Not Found`** if it doesn't exist:

```json
{
  "message": "Post id must be real"
}
```

### Update a post

```
PUT /posts/:id
```

**Body:** supports partial updates — only the fields sent are validated and updated. The body cannot be empty.

```json
{
  "title": "My Updated Blog Post"
}
```

- If `tags` is not included in the body, the post's existing tags are **left unchanged**.
- If `tags: []` is sent, all tags associated with the post are removed.

**Response `200 OK`:** the updated post.

**Response `400 Bad Request`** if the body is empty or any submitted field is invalid.

**Response `404 Not Found`** if the post doesn't exist.

### Delete a post

```
DELETE /posts/:id
```

**Response `204 No Content`** if deleted successfully.

**Response `404 Not Found`** if the post doesn't exist.

## Design notes

- **Auto-incrementing IDs (`BIGSERIAL`)** instead of UUIDs, to stay faithful to the original project spec.
- **Atomicity:** creating and updating posts along with their tags runs inside PostgreSQL functions (RPC), avoiding inconsistent states if an intermediate step fails.
- **Security:** hardened HTTP headers via `helmet`, no `X-Powered-By` exposure, and centralized error handling that avoids leaking internal details (stack traces, database driver messages) in client-facing responses.
- **Authentication and authorization:** out of scope for this project.
