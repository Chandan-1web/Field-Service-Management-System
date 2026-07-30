ALTER TABLE work_orders
ADD COLUMN closed_at DATETIME NULL;

ALTER TABLE work_orders
ADD COLUMN closure_note TEXT NULL;

