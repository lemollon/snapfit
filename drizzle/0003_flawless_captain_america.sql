CREATE TABLE "ai_program_drafts" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text NOT NULL,
	"client_id" text,
	"prompt" text,
	"client_profile" json,
	"goals" text[],
	"duration" integer,
	"days_per_week" integer,
	"equipment" text[],
	"restrictions" text[],
	"generated_program" json,
	"generated_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'draft',
	"accepted_at" timestamp,
	"resulting_program_id" text,
	"resulting_template_id" text
);
--> statement-breakpoint
CREATE TABLE "check_in_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"scheduled_check_in_id" text NOT NULL,
	"client_id" text NOT NULL,
	"trainer_id" text NOT NULL,
	"weight" real,
	"photo_urls" text[],
	"measurements" json,
	"mood_score" integer,
	"sleep_hours" real,
	"sleep_quality" integer,
	"nutrition_notes" text,
	"custom_answers" json,
	"client_notes" text,
	"trainer_notes" text,
	"trainer_reviewed_at" timestamp,
	"submitted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "check_in_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"frequency" text NOT NULL,
	"day_of_week" integer,
	"day_of_month" integer,
	"time_of_day" text,
	"collect_weight" boolean DEFAULT true,
	"collect_photos" boolean DEFAULT true,
	"collect_measurements" boolean DEFAULT false,
	"collect_mood" boolean DEFAULT true,
	"collect_sleep" boolean DEFAULT true,
	"collect_nutrition" boolean DEFAULT false,
	"custom_questions" json,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_engagement" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text NOT NULL,
	"client_id" text NOT NULL,
	"last_workout_at" timestamp,
	"last_check_in_at" timestamp,
	"last_message_at" timestamp,
	"workouts_last_7_days" integer DEFAULT 0,
	"workouts_last_30_days" integer DEFAULT 0,
	"average_workout_completion" real,
	"missed_scheduled_workouts" integer DEFAULT 0,
	"risk_score" integer DEFAULT 0,
	"risk_level" text DEFAULT 'low',
	"risk_factors" json,
	"alert_sent" boolean DEFAULT false,
	"alert_sent_at" timestamp,
	"alert_dismissed" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "client_engagement_trainer_id_client_id_unique" UNIQUE("trainer_id","client_id")
);
--> statement-breakpoint
CREATE TABLE "daily_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"weight" real,
	"body_fat" real,
	"mood" integer,
	"energy_level" integer,
	"sleep_hours" real,
	"sleep_quality" integer,
	"water_intake" real,
	"steps_count" integer,
	"notes" text,
	"total_calories" integer,
	"total_protein" real,
	"total_carbs" real,
	"total_fat" real,
	"total_fiber" real,
	"calorie_goal" integer,
	"protein_goal" real,
	"carb_goal" real,
	"fat_goal" real,
	"workouts_completed" integer DEFAULT 0,
	"workouts_planned" integer DEFAULT 0,
	"meals_logged" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_logs_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "form_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"trainer_id" text,
	"exercise_name" text NOT NULL,
	"video_url" text NOT NULL,
	"thumbnail_url" text,
	"duration" integer,
	"status" text DEFAULT 'pending',
	"ai_analysis" json,
	"ai_score" integer,
	"trainer_feedback" text,
	"trainer_score" integer,
	"key_points" json,
	"improvements" json,
	"created_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "global_challenge_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"challenge_id" text NOT NULL,
	"user_id" text NOT NULL,
	"progress" integer DEFAULT 0,
	"rank" integer,
	"completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"reward_claimed" boolean DEFAULT false,
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "global_challenge_participants_challenge_id_user_id_unique" UNIQUE("challenge_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "global_challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"type" text NOT NULL,
	"goal" integer NOT NULL,
	"unit" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"xp_reward" integer DEFAULT 500,
	"badge_id" text,
	"prize_description" text,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"min_level" integer DEFAULT 1,
	"max_participants" integer,
	"participant_count" integer DEFAULT 0,
	"completion_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "habit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"habit_id" text NOT NULL,
	"date" date NOT NULL,
	"completed" boolean DEFAULT false,
	"value" real,
	"notes" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "habit_logs_habit_id_date_unique" UNIQUE("habit_id","date")
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text DEFAULT 'check',
	"color" text DEFAULT 'violet',
	"type" text NOT NULL,
	"target_value" real,
	"unit" text,
	"frequency" text DEFAULT 'daily',
	"reminder_time" text,
	"reminder_enabled" boolean DEFAULT false,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"total_completions" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "personal_record_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"personal_record_id" text NOT NULL,
	"exercise_name" text NOT NULL,
	"record_type" text NOT NULL,
	"previous_value" real,
	"new_value" real NOT NULL,
	"improvement" real,
	"workout_id" text,
	"celebration_shown" boolean DEFAULT false,
	"achieved_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "personal_records" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"exercise_name" text NOT NULL,
	"category" text NOT NULL,
	"max_weight" real,
	"max_reps" integer,
	"max_weight_reps" json,
	"fastest_time" integer,
	"longest_distance" real,
	"longest_duration" integer,
	"unit" text DEFAULT 'kg',
	"notes" text,
	"achieved_at" timestamp DEFAULT now(),
	"workout_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "personal_records_user_id_exercise_name_unique" UNIQUE("user_id","exercise_name")
);
--> statement-breakpoint
CREATE TABLE "program_purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"user_id" text NOT NULL,
	"trainer_id" text NOT NULL,
	"price_paid" real NOT NULL,
	"currency" text DEFAULT 'USD',
	"payment_method" text,
	"payment_id" text,
	"started_at" timestamp,
	"current_week" integer DEFAULT 1,
	"completed_weeks" integer[],
	"status" text DEFAULT 'active',
	"completed_at" timestamp,
	"access_expires_at" timestamp,
	"purchased_at" timestamp DEFAULT now(),
	CONSTRAINT "program_purchases_program_id_user_id_unique" UNIQUE("program_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "program_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"review" text,
	"is_verified_purchase" boolean DEFAULT false,
	"helpful_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "program_reviews_program_id_user_id_unique" UNIQUE("program_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "program_weeks" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"week_number" integer NOT NULL,
	"name" text,
	"description" text,
	"workouts" json,
	"nutrition_plan" json,
	"tips" text,
	"video_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"category" text NOT NULL,
	"cuisine" text,
	"tags" text[],
	"prep_time" integer,
	"cook_time" integer,
	"servings" integer DEFAULT 1,
	"difficulty" text DEFAULT 'easy',
	"calories" integer,
	"protein" real,
	"carbs" real,
	"fat" real,
	"fiber" real,
	"ingredients" json,
	"instructions" json,
	"tips" text,
	"video_url" text,
	"is_public" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"save_count" integer DEFAULT 0,
	"rating" real,
	"rating_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recovery_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"sleep_hours" real,
	"sleep_quality" integer,
	"energy_level" integer,
	"motivation" integer,
	"stress_level" integer,
	"muscle_soreness" integer,
	"mood" integer,
	"resting_heart_rate" integer,
	"hrv" integer,
	"recovery_score" integer,
	"recommended_intensity" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "recovery_logs_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "revenue_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text NOT NULL,
	"month" date NOT NULL,
	"total_revenue" real DEFAULT 0,
	"program_revenue" real DEFAULT 0,
	"subscription_revenue" real DEFAULT 0,
	"other_revenue" real DEFAULT 0,
	"refunds" real DEFAULT 0,
	"net_revenue" real DEFAULT 0,
	"total_clients" integer DEFAULT 0,
	"new_clients" integer DEFAULT 0,
	"churned_clients" integer DEFAULT 0,
	"programs_sold" integer DEFAULT 0,
	"average_order_value" real,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "revenue_snapshots_trainer_id_month_unique" UNIQUE("trainer_id","month")
);
--> statement-breakpoint
CREATE TABLE "saved_recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipe_id" text NOT NULL,
	"saved_at" timestamp DEFAULT now(),
	CONSTRAINT "saved_recipes_user_id_recipe_id_unique" UNIQUE("user_id","recipe_id")
);
--> statement-breakpoint
CREATE TABLE "scheduled_check_ins" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"client_id" text NOT NULL,
	"trainer_id" text NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"status" text DEFAULT 'pending',
	"reminder_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content_type" text NOT NULL,
	"content_id" text,
	"platform" text NOT NULL,
	"share_image_url" text,
	"caption" text,
	"share_url" text,
	"clicks" integer DEFAULT 0,
	"shared_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "testimonial_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text NOT NULL,
	"client_id" text NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending',
	"requested_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"testimonial_id" text
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text NOT NULL,
	"client_id" text NOT NULL,
	"quote" text NOT NULL,
	"rating" integer,
	"before_photo_url" text,
	"after_photo_url" text,
	"before_weight" real,
	"after_weight" real,
	"transformation_duration" text,
	"program_id" text,
	"category" text,
	"display_name" text,
	"is_anonymous" boolean DEFAULT false,
	"is_approved" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"shareable_image_url" text,
	"shared_to_instagram" boolean DEFAULT false,
	"shared_to_website" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"approved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "timer_presets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"rounds" integer,
	"work_duration" integer,
	"rest_duration" integer,
	"total_duration" integer,
	"intervals" json,
	"countdown_beep" boolean DEFAULT true,
	"halfway_alert" boolean DEFAULT false,
	"voice_announcements" boolean DEFAULT true,
	"color" text DEFAULT 'violet',
	"is_favorite" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trainer_branding" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text NOT NULL,
	"business_name" text,
	"tagline" text,
	"logo_url" text,
	"logo_light_url" text,
	"favicon_url" text,
	"primary_color" text DEFAULT '#8B5CF6',
	"secondary_color" text DEFAULT '#EC4899',
	"accent_color" text DEFAULT '#06B6D4',
	"background_color" text DEFAULT '#0F172A',
	"font_family" text DEFAULT 'Inter',
	"heading_font" text,
	"custom_domain" text,
	"domain_verified" boolean DEFAULT false,
	"email_from_name" text,
	"email_footer" text,
	"instagram_handle" text,
	"tiktok_handle" text,
	"youtube_handle" text,
	"twitter_handle" text,
	"hide_snapfit_branding" boolean DEFAULT false,
	"custom_css" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "trainer_branding_trainer_id_unique" UNIQUE("trainer_id")
);
--> statement-breakpoint
CREATE TABLE "trainer_earnings" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text NOT NULL,
	"type" text NOT NULL,
	"amount" real NOT NULL,
	"currency" text DEFAULT 'USD',
	"fee" real DEFAULT 0,
	"net_amount" real NOT NULL,
	"status" text DEFAULT 'pending',
	"reference_type" text,
	"reference_id" text,
	"client_id" text,
	"description" text,
	"payout_id" text,
	"paid_out_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_programs" (
	"id" text PRIMARY KEY NOT NULL,
	"trainer_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"long_description" text,
	"cover_image_url" text,
	"preview_video_url" text,
	"duration_weeks" integer NOT NULL,
	"fitness_level" text NOT NULL,
	"category" text NOT NULL,
	"equipment" text[],
	"workouts_per_week" integer,
	"price" real NOT NULL,
	"currency" text DEFAULT 'USD',
	"sale_price" real,
	"sale_ends_at" timestamp,
	"is_drip_content" boolean DEFAULT true,
	"includes_nutrition" boolean DEFAULT false,
	"includes_coaching" boolean DEFAULT false,
	"max_participants" integer,
	"total_sales" integer DEFAULT 0,
	"total_revenue" real DEFAULT 0,
	"average_rating" real,
	"review_count" integer DEFAULT 0,
	"status" text DEFAULT 'draft',
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wearable_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"provider_user_id" text,
	"device_name" text,
	"last_sync_at" timestamp,
	"sync_steps" boolean DEFAULT true,
	"sync_heart_rate" boolean DEFAULT true,
	"sync_sleep" boolean DEFAULT true,
	"sync_workouts" boolean DEFAULT true,
	"sync_weight" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"connection_error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wearable_connections_user_id_provider_unique" UNIQUE("user_id","provider")
);
--> statement-breakpoint
CREATE TABLE "wearable_data" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"connection_id" text NOT NULL,
	"date" date NOT NULL,
	"steps" integer,
	"active_minutes" integer,
	"calories_burned" integer,
	"distance" real,
	"floors" integer,
	"resting_heart_rate" integer,
	"average_heart_rate" integer,
	"max_heart_rate" integer,
	"hrv" integer,
	"sleep_duration" integer,
	"sleep_quality" integer,
	"deep_sleep" integer,
	"rem_sleep" integer,
	"light_sleep" integer,
	"awake_time" integer,
	"blood_oxygen" integer,
	"body_temperature" real,
	"respiratory_rate" integer,
	"raw_data" json,
	"synced_at" timestamp DEFAULT now(),
	CONSTRAINT "wearable_data_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "experience_level" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "activity_level" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "ai_program_drafts" ADD CONSTRAINT "ai_program_drafts_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_program_drafts" ADD CONSTRAINT "ai_program_drafts_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_program_drafts" ADD CONSTRAINT "ai_program_drafts_resulting_program_id_training_programs_id_fk" FOREIGN KEY ("resulting_program_id") REFERENCES "public"."training_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_program_drafts" ADD CONSTRAINT "ai_program_drafts_resulting_template_id_workout_templates_id_fk" FOREIGN KEY ("resulting_template_id") REFERENCES "public"."workout_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in_responses" ADD CONSTRAINT "check_in_responses_scheduled_check_in_id_scheduled_check_ins_id_fk" FOREIGN KEY ("scheduled_check_in_id") REFERENCES "public"."scheduled_check_ins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in_responses" ADD CONSTRAINT "check_in_responses_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in_responses" ADD CONSTRAINT "check_in_responses_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in_templates" ADD CONSTRAINT "check_in_templates_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_engagement" ADD CONSTRAINT "client_engagement_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_engagement" ADD CONSTRAINT "client_engagement_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_checks" ADD CONSTRAINT "form_checks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_checks" ADD CONSTRAINT "form_checks_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "global_challenge_participants" ADD CONSTRAINT "global_challenge_participants_challenge_id_global_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."global_challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "global_challenge_participants" ADD CONSTRAINT "global_challenge_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_record_history" ADD CONSTRAINT "personal_record_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_record_history" ADD CONSTRAINT "personal_record_history_personal_record_id_personal_records_id_fk" FOREIGN KEY ("personal_record_id") REFERENCES "public"."personal_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_record_history" ADD CONSTRAINT "personal_record_history_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_purchases" ADD CONSTRAINT "program_purchases_program_id_training_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_purchases" ADD CONSTRAINT "program_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_purchases" ADD CONSTRAINT "program_purchases_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_reviews" ADD CONSTRAINT "program_reviews_program_id_training_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_reviews" ADD CONSTRAINT "program_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_weeks" ADD CONSTRAINT "program_weeks_program_id_training_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_logs" ADD CONSTRAINT "recovery_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_snapshots" ADD CONSTRAINT "revenue_snapshots_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_recipes" ADD CONSTRAINT "saved_recipes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_recipes" ADD CONSTRAINT "saved_recipes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_check_ins" ADD CONSTRAINT "scheduled_check_ins_template_id_check_in_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."check_in_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_check_ins" ADD CONSTRAINT "scheduled_check_ins_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_check_ins" ADD CONSTRAINT "scheduled_check_ins_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_shares" ADD CONSTRAINT "social_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonial_requests" ADD CONSTRAINT "testimonial_requests_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonial_requests" ADD CONSTRAINT "testimonial_requests_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonial_requests" ADD CONSTRAINT "testimonial_requests_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_program_id_training_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_presets" ADD CONSTRAINT "timer_presets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_branding" ADD CONSTRAINT "trainer_branding_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_earnings" ADD CONSTRAINT "trainer_earnings_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_earnings" ADD CONSTRAINT "trainer_earnings_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_programs" ADD CONSTRAINT "training_programs_trainer_id_users_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wearable_connections" ADD CONSTRAINT "wearable_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wearable_data" ADD CONSTRAINT "wearable_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wearable_data" ADD CONSTRAINT "wearable_data_connection_id_wearable_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."wearable_connections"("id") ON DELETE cascade ON UPDATE no action;