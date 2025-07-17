-- Backfill for 'procurement' table
UPDATE procurement
SET workspace_id = (
    SELECT o.workspace_id
    FROM "order" o
    WHERE o.id = procurement.order_id
);

-- Backfill for 'order_assignee' table (assuming it's similar to procurement, linking via order_id)
UPDATE order_assignee
SET workspace_id = (
    SELECT o.workspace_id
    FROM "order" o
    WHERE o.id = order_assignee.order_id
);