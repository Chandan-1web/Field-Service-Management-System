CREATE TABLE work_order_attachments (

    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    work_order_id BIGINT NOT NULL,

    uploaded_by BIGINT NOT NULL,

    file_name VARCHAR(255) NOT NULL,

    stored_file_name VARCHAR(255) NOT NULL,

    file_type VARCHAR(100) NOT NULL,

    file_size BIGINT NOT NULL,

    uploaded_at DATETIME NOT NULL,

    CONSTRAINT fk_attachment_work_order
        FOREIGN KEY(work_order_id)
        REFERENCES work_orders(id),

    CONSTRAINT fk_attachment_user
        FOREIGN KEY(uploaded_by)
        REFERENCES users(id)
);