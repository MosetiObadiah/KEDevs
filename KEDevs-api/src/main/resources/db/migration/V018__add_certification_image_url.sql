-- V018__add_certification_image_url.sql
ALTER TABLE developer_certifications ADD COLUMN cert_image_url VARCHAR(500);
