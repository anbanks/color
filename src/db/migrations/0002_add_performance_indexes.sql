CREATE INDEX IF NOT EXISTS idx_palettes_status_published ON palettes(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_palettes_author ON palettes(author_id);
CREATE INDEX IF NOT EXISTS idx_palette_content_lookup ON palette_content(palette_id, locale);
CREATE INDEX IF NOT EXISTS idx_likes_palette ON likes(palette_id);
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_palettes_collection ON collection_palettes(collection_id);
