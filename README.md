# Blogging-Platform-API

## MVC Arquitecture

blog-api/
│
├── src/
│ ├── config/
│ │ └── supabaseClient.js # Conexión al cliente de Supabase
│ │
│ ├── models/
│ │ └── post.model.js # Lógica de acceso a datos (queries a la tabla posts)
│ │
│ ├── controllers/
│ │ └── post.controller.js # Lógica de negocio: recibe req, llama al model, arma la respuesta
│ │
│ ├── routes/
│ │ └── post.routes.js # Define los endpoints y los conecta con el controller
│ │
│ ├── middlewares/
│ │ ├── validatePost.js # Validación del body (create/update)
│ │ └── errorHandler.js # Middleware centralizado de manejo de errores
│ │
│ └── app.js # Configura Express, middlewares globales, monta rutas
│
├── .env # SUPABASE_URL, SUPABASE_KEY, PORT
├── .gitignore
├── package.json
└── server.js # Punto de entrada: importa app.js y levanta el servidor

## Flujo de una petición

Cliente (Postman/browser)
│
▼
routes/post.routes.js → decide qué controller ejecutar según método + URL
│
▼
middlewares/validatePost.js → valida el body antes de llegar al controller (solo en POST/PUT)
│
▼
controllers/post.controller.js → orquesta: llama al model, maneja status codes y respuestas
│
▼
models/post.model.js → habla directamente con Supabase (queries)
│
▼
config/supabaseClient.js → cliente configurado que el model usa

## Data base Scheme

-- Extensión para búsquedas wildcard eficientes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tabla principal de posts
CREATE TABLE posts (
id BIGSERIAL PRIMARY KEY,
title TEXT NOT NULL,
content TEXT NOT NULL,
category TEXT NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de tags
CREATE TABLE tags (
id BIGSERIAL PRIMARY KEY,
name TEXT NOT NULL UNIQUE
);

-- Tabla pivote post_tags
CREATE TABLE post_tags (
post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
PRIMARY KEY (post_id, tag_id)
);

-- Índices para búsqueda wildcard (ILIKE '%term%')
CREATE INDEX idx_posts_title_trgm ON posts USING GIN (title gin_trgm_ops);
CREATE INDEX idx_posts_content_trgm ON posts USING GIN (content gin_trgm_ops);
CREATE INDEX idx_posts_category_trgm ON posts USING GIN (category gin_trgm_ops);

-- Índices en las FKs de la tabla pivote
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

## Plan de pasos

## mkdir -p src/config src/models src/controllers src/routes src/middlewares

## touch src/app.js server.js .env .env.example .gitignore

1. Configuración inicial del proyecto

## Inicializar proyecto Node.js (npm init)

## Instalar dependencias: express, @supabase/supabase-js (o pg si prefieres SQL directo), dotenv, cors

## Instalar dependencias de desarrollo: nodemon

## Crear estructura de carpetas (MVC-ish): /routes, /controllers, /config, /middleware

2. Configurar Supabase

## Crear proyecto en Supabase (si no lo tienes ya)

## Crear la tabla posts con sus columnas (id, title, content, category, tags, created_at, updated_at)

## Obtener las credenciales (URL y API key) y guardarlas en .env

3. Conexión a la base de datos

## Crear el cliente de Supabase en /config/supabaseClient.js

4. Modelo/capa de datos

Crear funciones para interactuar con la tabla posts (crear, leer, actualizar, eliminar, buscar)

5. Validación

Definir reglas de validación para el body del POST/PUT (title, content, category, tags requeridos, tipos correctos)
Elegir herramienta: validación manual o librería como joi / express-validator

6. Controladores

createPost, getPost, getAllPosts, updatePost, deletePost
Manejo de errores y códigos de estado según el spec (201, 200, 204, 400, 404)

7. Rutas

Definir /posts y /posts/:id con los métodos correspondientes (GET, POST, PUT, DELETE)
Soporte para query param ?term= en el GET de todos los posts

8. Middleware de manejo de errores

Middleware centralizado para capturar y formatear errores

9. Archivo principal (app.js / server.js)

Configurar Express, middlewares (json parser, cors), montar rutas, levantar servidor

10. Pruebas

Probar cada endpoint con Postman/Thunder Client/curl
Verificar códigos de estado y respuestas según el spec
Probar la búsqueda con term

11. (Opcional) Documentación

README con instrucciones de instalación y ejemplos de uso de cada endpoint
