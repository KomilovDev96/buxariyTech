ALTER TABLE "Project" ADD COLUMN "goal" TEXT NOT NULL DEFAULT '', ADD COLUMN "businessContext" TEXT NOT NULL DEFAULT '', ADD COLUMN "aiContribution" TEXT NOT NULL DEFAULT '';
CREATE TABLE "SiteBlock" (
  "key" TEXT NOT NULL, "locale" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT '', "body" TEXT NOT NULL DEFAULT '',
  "label" TEXT NOT NULL DEFAULT '', "imageAlt" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT NOT NULL DEFAULT '', "imageKey" TEXT NOT NULL DEFAULT '',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteBlock_pkey" PRIMARY KEY ("key", "locale"),
  CONSTRAINT "SiteBlock_key_check" CHECK ("key" IN ('hero', 'story', 'cta')),
  CONSTRAINT "SiteBlock_locale_check" CHECK ("locale" IN ('uz', 'ru', 'en'))
);
