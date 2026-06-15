# Asyl Tuqym / Асыл Тұқым

Bilingual livestock marketplace MVP for Kazakhstan. Sellers can register by phone, edit a public farm profile, submit livestock listings to moderation, and admins can approve, reject, archive, or verify sellers. Buyers browse and filter approved listings without registration.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/ru](http://localhost:3000/ru) or [http://localhost:3000/kk](http://localhost:3000/kk).

Demo accounts:

- Seller: `+77001112233` / `demo123`
- Admin: set with `ASYL_ADMIN_PHONE` / `ASYL_ADMIN_PASSWORD` before running `npm run db:seed`

## Database

The app runs with an in-memory demo store by default so the marketplace opens without PostgreSQL.

To use Prisma + PostgreSQL:

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`.
3. Set `ASYL_USE_DATABASE="true"`.
4. Set `AUTH_SECRET`, `ASYL_ADMIN_PHONE`, and `ASYL_ADMIN_PASSWORD`.
5. Run:

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

When `ASYL_USE_DATABASE="true"`, database errors are fatal. The app will not silently fall back to demo data in production.

## Uploads

Local development writes images to `public/uploads` and private documents to `storage/uploads/documents`.
Set `BLOB_READ_WRITE_TOKEN` in Vercel to store new images and documents in Vercel Blob. Public images are saved as Blob URLs. Document Blob URLs remain behind the existing admin-only `/[locale]/documents/[listingId]` route.

## Key Routes

- `/ru` and `/kk` - recommended livestock feed
- `/ru/search` - search and filters
- `/ru/lots/[id]` - listing details
- `/ru/auth` - seller/admin login and registration
- `/ru/sell` - submit a listing for moderation
- `/ru/profile` - seller profile settings and private listing statuses
- `/ru/admin/moderation` - admin moderation queue
