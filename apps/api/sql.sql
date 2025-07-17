UPDATE order_item
SET workspace_id = (
    SELECT o.workspace_id
    FROM "order" o
    WHERE o.id = order_item.order_id
);