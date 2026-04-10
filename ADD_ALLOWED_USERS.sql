-- Add allowed users to whitelist
-- Run this SQL after creating the table

INSERT INTO allowed_users (email, name, is_active)
VALUES
  ('tuong.nguyen@ipos.vn', 'Nguyễn Tuổng', true),
  ('ngoc.le@ipos.vn', 'Lê Ngọc', true),
  ('binh.tran@ipos.vn', 'Trần Bình', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;
