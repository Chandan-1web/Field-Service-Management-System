CREATE TABLE work_order_comments (

    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    work_order_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    comment TEXT NOT NULL,

    created_at DATETIME NOT NULL,

    CONSTRAINT fk_comment_work_order
        FOREIGN KEY (work_order_id)
        REFERENCES work_orders(id),

    CONSTRAINT fk_comment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);