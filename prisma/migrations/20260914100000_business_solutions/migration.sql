CREATE TABLE "BusinessSolution" (
  "id" TEXT NOT NULL, "title" TEXT NOT NULL, "slug" TEXT NOT NULL,
  "locale" TEXT NOT NULL, "sector" TEXT NOT NULL,
  "description" TEXT NOT NULL, "audience" TEXT NOT NULL,
  "features" TEXT[] NOT NULL, "workflow" TEXT[] NOT NULL,
  "outcome" TEXT NOT NULL DEFAULT '', "priceLabel" TEXT NOT NULL DEFAULT '',
  "readiness" TEXT NOT NULL DEFAULT 'CONCEPT',
  "featured" BOOLEAN NOT NULL DEFAULT false, "order" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "BusinessSolution_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BusinessSolution_locale_check" CHECK ("locale" IN ('uz', 'ru', 'en')),
  CONSTRAINT "BusinessSolution_sector_check" CHECK ("sector" IN ('FINANCE', 'MANUFACTURING', 'TRADE', 'SERVICES')),
  CONSTRAINT "BusinessSolution_readiness_check" CHECK ("readiness" IN ('CONCEPT', 'AVAILABLE'))
);
CREATE UNIQUE INDEX "BusinessSolution_slug_locale_key" ON "BusinessSolution"("slug", "locale");
CREATE INDEX "BusinessSolution_published_locale_order_idx" ON "BusinessSolution"("published", "locale", "order");
ALTER TABLE "SiteBlock" DROP CONSTRAINT "SiteBlock_key_check";
ALTER TABLE "SiteBlock" ADD CONSTRAINT "SiteBlock_key_check" CHECK ("key" IN ('hero', 'story', 'cta', 'solutions'));
