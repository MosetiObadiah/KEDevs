-- Update existing job_posts to use PUBLIC/PRIVATE instead of EXTERNAL/INTERNAL
UPDATE job_posts SET visibility = 'PUBLIC' WHERE visibility = 'EXTERNAL';
UPDATE job_posts SET visibility = 'PRIVATE' WHERE visibility = 'INTERNAL';
