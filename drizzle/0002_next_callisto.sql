CREATE TABLE "trainer_products" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"product_url" text NOT NULL,
	"category" text NOT NULL,
	"price" real,
	"currency" text DEFAULT 'USD',
	"is_featured" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "shop_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "amazon_storefront" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "supplement_store_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "apparel_store_url" text;--> statement-breakpoint
ALTER TABLE "trainer_products" ADD CONSTRAINT "trainer_products_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;