CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_site_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE work_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    sla_due_at TIMESTAMP NULL,
    customer_id BIGINT NOT NULL,
    site_id BIGINT NOT NULL,
    assigned_to BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wo_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_wo_site FOREIGN KEY (site_id) REFERENCES sites(id),
    CONSTRAINT fk_wo_user FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE work_order_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by BIGINT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note VARCHAR(255),
    CONSTRAINT fk_hist_workorder FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_hist_user FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE TABLE parts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_qty INT NOT NULL DEFAULT 0
);

CREATE TABLE part_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    part_id BIGINT NOT NULL,
    qty_used INT NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pu_workorder FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_pu_part FOREIGN KEY (part_id) REFERENCES parts(id)
);

CREATE TABLE time_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    technician_id BIGINT NOT NULL,
    minutes INT NOT NULL,
    note VARCHAR(255),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tl_workorder FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    CONSTRAINT fk_tl_user FOREIGN KEY (technician_id) REFERENCES users(id)
);