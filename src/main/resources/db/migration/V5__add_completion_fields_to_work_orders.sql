ALTER TABLE work_orders
ADD COLUMN completed_at DATETIME NULL;

ALTER TABLE work_orders
ADD COLUMN completion_note TEXT;