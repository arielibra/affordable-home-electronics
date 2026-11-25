-- "How did you hear about us?" now offers Google, ChatGPT, Gemini and Other.
-- When a customer picks Other they can type where; that text lives here.
ALTER TABLE orders ADD COLUMN heard_about_other TEXT NOT NULL DEFAULT '';
