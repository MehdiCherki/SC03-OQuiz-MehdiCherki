-- ============================
-- TABLE: user
-- ============================
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- TABLE: video
-- ============================
CREATE TABLE video (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL UNIQUE,
  thumbnail_url TEXT,
  author_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- TABLE: playlist
-- ============================
CREATE TABLE playlist (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL,
  user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- TABLE: comment
-- ============================
CREATE TABLE comment (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  video_id INTEGER NOT NULL REFERENCES video(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  parent_comment_id INTEGER REFERENCES comment(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- TABLE: tag
-- ============================
CREATE TABLE tag (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- TABLE: search
-- ============================
CREATE TABLE search (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- TABLE: video_playlist
-- ============================
CREATE TABLE video_playlist (
  video_id INTEGER NOT NULL REFERENCES video(id) ON DELETE CASCADE,
  playlist_id INTEGER NOT NULL REFERENCES playlist(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (video_id, playlist_id)
);

-- ============================
-- TABLE: video_tag
-- ============================
CREATE TABLE video_tag (
  video_id INTEGER NOT NULL REFERENCES video(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (video_id, tag_id)
);

-- ============================
-- TABLE: subscription
-- ============================
CREATE TABLE subscription (
  follower_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  followed_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id)
);

-- ============================
-- TABLE: view
-- ============================
CREATE TABLE view (
  id SERIAL PRIMARY KEY,
  video_id INTEGER NOT NULL REFERENCES video(id) ON DELETE CASCADE,
  viewer_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- TABLE: like
-- ============================
CREATE TABLE "like" (
  video_id INTEGER NOT NULL REFERENCES video(id) ON DELETE CASCADE,
  viewer_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (video_id, viewer_id)
);
