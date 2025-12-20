-- Add new columns to custom_tags table
ALTER TABLE custom_tags ADD COLUMN name_zh TEXT;
ALTER TABLE custom_tags ADD COLUMN category TEXT DEFAULT 'Custom';
