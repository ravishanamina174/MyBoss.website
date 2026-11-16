ALTER TABLE businesses
    ADD COLUMN public_identifier VARCHAR(36),
    ADD COLUMN profile_description TEXT,
    ADD COLUMN contact_email VARCHAR(320),
    ADD COLUMN phone_number VARCHAR(50),
    ADD COLUMN address_line1 VARCHAR(200),
    ADD COLUMN address_line2 VARCHAR(200),
    ADD COLUMN city VARCHAR(100),
    ADD COLUMN region VARCHAR(100),
    ADD COLUMN postal_code VARCHAR(30),
    ADD COLUMN country VARCHAR(100),
    ADD COLUMN website_url VARCHAR(500),
    ADD COLUMN facebook_url VARCHAR(500),
    ADD COLUMN instagram_url VARCHAR(500),
    ADD COLUMN linkedin_url VARCHAR(500),
    ADD COLUMN profile_image_url VARCHAR(1000),
    ADD COLUMN cover_image_url VARCHAR(1000),
    ADD COLUMN gallery_urls TEXT NOT NULL DEFAULT '[]',
    ADD COLUMN profile_published BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN card_description VARCHAR(500),
    ADD COLUMN card_contact_name VARCHAR(150),
    ADD COLUMN card_contact_email VARCHAR(320),
    ADD COLUMN card_phone_number VARCHAR(50),
    ADD COLUMN card_website_url VARCHAR(500),
    ADD COLUMN card_logo_url VARCHAR(1000),
    ADD COLUMN card_published BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE businesses
SET public_identifier = md5(random()::text || clock_timestamp()::text || id::text)
WHERE public_identifier IS NULL;

ALTER TABLE businesses
    ALTER COLUMN public_identifier SET NOT NULL;

ALTER TABLE businesses
    ADD CONSTRAINT uq_businesses_public_identifier UNIQUE (public_identifier),
    ADD CONSTRAINT chk_businesses_gallery_urls_json
        CHECK (jsonb_typeof(gallery_urls::jsonb) = 'array');
