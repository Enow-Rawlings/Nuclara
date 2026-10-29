-- =============================================================================
-- Migration 001: Enable required PostgreSQL extensions
-- =============================================================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Case-insensitive text (used for email lookups)
CREATE EXTENSION IF NOT EXISTS "citext";

-- Full-text search with trigram similarity
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
