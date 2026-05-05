-- Add screenshot URL support for developer projects
ALTER TABLE developer_projects
    ADD COLUMN screenshot_url TEXT;
