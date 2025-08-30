User Stories for Testing

These cover auth, transactions (manual, CSV, OCR), editing, AI advice, social/collaboration, and storage security.
Each story includes Preconditions, Steps, and Expected Outcome (to guide automated testing).

🔐 Authentication & Profiles

Sign Up & Profile

Preconditions: None.

Steps: User signs up with email/password, creates username.

Expected: New row in profiles table, user is logged in, can see dashboard.

Login

Steps: User logs out, then logs back in.

Expected: Session restored, personal dashboard loads.

💳 Transactions

Manual Transaction Entry

Steps: User enters expense: Date=2025-01-15, Store=Starbucks, Amount=5.50, Category=Food.

Expected: New transaction appears in list & pie chart.

CSV Import (Bank Statement)

Preconditions: bank1.csv in /tests/data/csv/.

Steps: User uploads CSV, maps columns, confirms import.

Expected: All rows added as transactions, each editable.

OCR Receipt Upload

Preconditions: receipt1.jpg in /tests/data/receipts/.

Steps: User uploads receipt.

Expected: Items extracted with Tesseract.js, stored in transactions.items. Merged if duplicate by date/amount.

Smart Duplicate Merging

Preconditions: Transaction already exists from CSV.

Steps: Upload receipt with same date + total.

Expected: App merges, avoids duplicate.

✏️ Transaction Management

Edit Transaction

Steps: User edits Starbucks transaction to amount 6.00.

Expected: Value updated in DB + charts recalc.

Delete Transaction

Steps: User deletes Starbucks transaction.

Expected: Transaction removed, chart updates.

📸 Storage Security

Receipt Access

Preconditions: User A uploads receipt.

Steps: User B tries to fetch A’s receipt.

Expected: Access denied by RLS.

👥 Social & Family Budget

Send Friend Request

Steps: User A sends request to User B.

Expected: friendships row created with status=pending.

Accept Friend Request

Steps: User B accepts.

Expected: status=accepted. Both see “Family Budget” combined view.

Remove Friend

Steps: User A removes B.

Expected: Row deleted. Combined budgets disappear instantly.

🤖 AI Advisor

Get AI Advice

Preconditions: Transactions exist for Food, Rent, Entertainment.

Steps: User clicks “✨ Get AI Budget Suggestions”.

Expected: Edge function calls Groq API with system prompt, returns personalized advice card.

Advice Display Format

Steps: Inspect dashboard after advice request.

Expected: Advice shown in styled card (title + bullet recommendations).

📊 Dashboard & Views

Personal Dashboard

Steps: User logs in.

Expected: Sees only their transactions in pie chart & tables.

Friend’s View

Preconditions: Friendship accepted.

Steps: User selects Friend’s Dashboard.

Expected: Sees only Friend’s transactions.

Combined Family Budget

Steps: User opens Family Budget view.

Expected: Chart merges both users’ data.

📂 Folder for Stories

Save as /tests/user-stories.md

The AI Agent can then:

Run integration tests for each story.

Use your test data folder (/tests/data/receipts/, /tests/data/csv/) as inputs.

Verify expected DB changes + UI updates
