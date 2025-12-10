ALTER TABLE "users_table" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "username" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users_table" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users_table" ADD CONSTRAINT "users_table_username_unique" UNIQUE("username");