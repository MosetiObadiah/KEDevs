-- Seed default admin user
INSERT INTO users (
  id, email, password, full_name, role, auth_provider, 
  email_verified, account_status, grace_period_ends_at,
  subscription_expires_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@kedevs.com',
  '$2a$10$BGlEchDJxoO18lu9UI2jh.t2JsIRgaLA9a7Zg71qB4obZmKANMfbm',
  'Platform Admin',
  'ADMIN',
  'LOCAL',
  true,
  'ACTIVE',
  NULL,
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
