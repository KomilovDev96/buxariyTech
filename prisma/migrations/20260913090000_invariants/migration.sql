ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_consent_required" CHECK ("consentGiven" = true);
CREATE UNIQUE INDEX "one_cover_per_project" ON "ProjectImage" ("projectId") WHERE "isCover" = true;
CREATE UNIQUE INDEX "one_active_privacy_policy" ON "PrivacyPolicy" ("active") WHERE "active" = true;
