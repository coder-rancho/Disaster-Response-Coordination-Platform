-- Enable PostGIS extension for geospatial functionality
CREATE EXTENSION IF NOT EXISTS postgis;

-- Disasters table
CREATE TABLE IF NOT EXISTS disasters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    location_name TEXT NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    owner_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    audit_trail JSONB DEFAULT '[]'::jsonb
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location_name TEXT NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Cache table for API responses
CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Create indexes for optimizing queries

-- Disasters table indexes
CREATE INDEX IF NOT EXISTS disasters_location_idx ON disasters USING GIST (location);
CREATE INDEX IF NOT EXISTS disasters_tags_idx ON disasters USING GIN (tags);
CREATE INDEX IF NOT EXISTS disasters_owner_id_idx ON disasters(owner_id);

-- Resources table indexes
CREATE INDEX IF NOT EXISTS resources_location_idx ON resources USING GIST (location);
CREATE INDEX IF NOT EXISTS resources_disaster_id_idx ON resources(disaster_id);
CREATE INDEX IF NOT EXISTS resources_type_idx ON resources(type);

-- Reports table indexes
CREATE INDEX IF NOT EXISTS reports_disaster_id_idx ON reports(disaster_id);

-- Cache table index
CREATE INDEX IF NOT EXISTS cache_expires_at_idx ON cache(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update the updated_at column
CREATE TRIGGER update_disasters_updated_at
    BEFORE UPDATE ON disasters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to add audit trail entry
CREATE OR REPLACE FUNCTION add_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    NEW.audit_trail = NEW.audit_trail || jsonb_build_object(
        'action', TG_OP,
        'timestamp', CURRENT_TIMESTAMP,
        'user_id', NEW.owner_id
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for audit trail
CREATE TRIGGER disasters_audit_trail
    BEFORE INSERT OR UPDATE ON disasters
    FOR EACH ROW
    EXECUTE FUNCTION add_audit_trail();

-- Sample data for testing
INSERT INTO disasters (title, location_name, location, description, tags, owner_id)
VALUES (
    'NYC Flood',
    'Manhattan, NYC',
    ST_SetSRID(ST_MakePoint(-74.0060, 40.7128), 4326)::geography,
    'Heavy flooding in Manhattan',
    ARRAY['flood', 'urgent'],
    'netrunnerX'
) ON CONFLICT DO NOTHING;

-- Create a function to find nearby resources
CREATE OR REPLACE FUNCTION find_nearby_resources(
    disaster_point GEOGRAPHY,
    distance_meters INT DEFAULT 10000
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    location_name TEXT,
    type VARCHAR(50),
    distance FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.location_name,
        r.type,
        ST_Distance(r.location, disaster_point) as distance
    FROM resources r
    WHERE ST_DWithin(r.location, disaster_point, distance_meters)
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;
