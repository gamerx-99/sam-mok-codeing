-- Tool usage logging: one row per completed tool run (C1-style audit)
CREATE TABLE IF NOT EXISTS "toolUsageLogs" (
  "id" serial PRIMARY KEY,
  "userId" integer,
  "toolId" varchar(80) NOT NULL,
  "toolName" varchar(160) NOT NULL,
  "toolKind" varchar(40) NOT NULL,
  "fileCount" integer DEFAULT 0 NOT NULL,
  "fileBytes" integer DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'success' NOT NULL,
  "detail" text,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
