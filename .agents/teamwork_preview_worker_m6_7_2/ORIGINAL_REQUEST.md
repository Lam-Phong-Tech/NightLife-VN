## 2026-07-16T02:47:22Z
You are teamwork_preview_worker.
Your identity: Worker 2 - Partner Form Go-Live Fallback Fix.
Your working directory is: d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_m6_7_2/
Your task is to fix the missing fallback mapping for casts and media when normalizing the "live" store data in nightlife-data.service.ts.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Steps:
1. In `backend/src/nightlife-data/nightlife-data.service.ts`:
   - In `getPartnerListingStore` (around line 15350), update the `media` relation select block to include `castId: true`.
   - In `normalizePartnerListingDraft` (around lines 15690-15710):
     - Update `coverImageUrl` to fall back to `store.media` Cover Image if `dto.coverImageUrl` is undefined:
       `const coverImageUrl = this.cleanNullableText(dto.coverImageUrl) ?? store.media.find(m => m.purpose === 'PARTNER_LISTING_STORE' || m.purpose === 'STORE_COVER' || m.purpose === 'COVER_IMAGE')?.url ?? store.media.find(m => m.type === 'IMAGE')?.url ?? null;`
     - Update `galleryUrls` to fall back to store media URLs (type IMAGE and not cover) if `dto.galleryUrls` is undefined:
       `const galleryUrls = dto.galleryUrls !== undefined ? this.cleanStringArray(dto.galleryUrls, 12) : store.media.filter(m => m.type === 'IMAGE' && m.purpose !== 'COVER_IMAGE' && !m.castId).map(m => m.url).slice(0, 12);`
     - Update `videoUrls` to fall back to store media URLs (type VIDEO) if `dto.videoUrls` is undefined:
       `const videoUrls = dto.videoUrls !== undefined ? this.cleanStringArray(dto.videoUrls, 8) : store.media.filter(m => m.type === 'VIDEO').map(m => m.url).slice(0, 8);`
     - Update `castProfiles` to fall back to mapping `store.casts` if `dto.castProfiles` is undefined:
       ```typescript
       const castProfiles = dto.castProfiles !== undefined
         ? (this.normalizePartnerRequestCasts(dto.castProfiles) as PartnerListingCastDto[])
         : store.casts.map(cast => ({
             stageName: cast.stageName,
             publicHeadline: cast.publicHeadline ?? '',
             bio: cast.bio ?? '',
             tags: cast.tags,
             languages: cast.languages,
             birthMonth: cast.birthMonth ?? undefined,
             zodiacSign: cast.zodiacSign ?? undefined,
             heightCm: cast.heightCm ?? undefined,
             measurements: cast.measurements ?? '',
             hobbies: cast.hobbies,
             youtubeLinks: cast.youtubeLinks,
             hourlyRateVnd: cast.hourlyRateVnd ? Number(cast.hourlyRateVnd) : undefined,
             mediaUrls: store.media.filter(m => m.castId === cast.id).map(m => m.url),
           }));
       ```
2. Compile and test the changes:
   - Run `npm run build` in the `backend/` directory to ensure backend builds cleanly.
   - Run `npm run test` in `backend/` to ensure all tests pass.
3. Perform Git Operations:
   - Run `git add` for `nightlife-data.service.ts`.
   - Run `git commit -m "fix partner live view toggle casts and media fallback"`
   - Run `git push`
4. Save your handoff report to `d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_m6_7_2/handoff.md`.
