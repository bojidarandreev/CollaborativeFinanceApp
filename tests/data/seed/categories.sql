-- categories.sql

INSERT INTO categories (id, name, icon)
VALUES
-- Housing & Utilities
(gen_random_uuid(), 'Rent / Mortgage', '🏠'),
(gen_random_uuid(), 'Utilities', '💡'),
(gen_random_uuid(), 'Internet', '🌐'),
(gen_random_uuid(), 'Mobile Phone', '📱'),
(gen_random_uuid(), 'Repairs & Maintenance', '🛠️'),
(gen_random_uuid(), 'Household Supplies', '🧻'),

-- Food & Dining
(gen_random_uuid(), 'Groceries', '🛒'),
(gen_random_uuid(), 'Restaurants', '🍽️'),
(gen_random_uuid(), 'Coffee Shops', '☕'),
(gen_random_uuid(), 'Bars & Pubs', '🍻'),

-- Transportation
(gen_random_uuid(), 'Fuel / Gas', '⛽'),
(gen_random_uuid(), 'Public Transport', '🚌'),
(gen_random_uuid(), 'Ridesharing / Taxis', '🚕'),
(gen_random_uuid(), 'Vehicle Maintenance', '🚗'),

-- Health & Wellness
(gen_random_uuid(), 'Healthcare', '⚕️'),
(gen_random_uuid(), 'Pharmacy', '💊'),
(gen_random_uuid(), 'Fitness', '💪'),
(gen_random_uuid(), 'Personal Care', '🧴'),

-- Entertainment & Recreation
(gen_random_uuid(), 'Entertainment', '🎬'),
(gen_random_uuid(), 'Streaming Services', '📺'),
(gen_random_uuid(), 'Hobbies', '🎨'),
(gen_random_uuid(), 'Vacation & Travel', '✈️'),
(gen_random_uuid(), 'Books & Music', '📚'),

-- Shopping
(gen_random_uuid(), 'Shopping', '🛍️'),
(gen_random_uuid(), 'Clothing', '👕'),
(gen_random_uuid(), 'Electronics', '💻'),
(gen_random_uuid(), 'Gifts', '🎁'),

-- Family & Dependents
(gen_random_uuid(), 'Children', '👶'),
(gen_random_uuid(), 'Pets', '🐾'),
(gen_random_uuid(), 'Education', '🎓'),

-- Financial
(gen_random_uuid(), 'Savings', '🏦'),
(gen_random_uuid(), 'Investments', '📈'),
(gen_random_uuid(), 'Debt Payment', '💳'),
(gen_random_uuid(), 'Taxes', '🧾'),

-- Miscellaneous
(gen_random_uuid(), 'Charity', '❤️'),
(gen_random_uuid(), 'Miscellaneous', '❓');
