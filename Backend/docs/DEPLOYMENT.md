# Deployment

## Recommended order

1. Create a private PostgreSQL database with backups and point-in-time recovery.
2. Create a limited application user for NovaVolt.
3. Set secrets and variables from `.env.example` in your secret manager.
4. Build the backend with the Node scripts in this repository and publish the immutable artifact.
5. Start the backend with `npm start` (or `npm run start:prod`). Its `prestart:prod` hook runs `prisma migrate deploy` first, so a new Neon database receives every versioned table, index, enum, and constraint before the API accepts traffic.
6. Deploy the API behind TLS and use `/api/v1/health/ready` as the readiness probe.
7. Test signup, notifications, file uploads, malware checks, and a Stripe test payment.

Generate `NOTIFICATION_PAYLOAD_ENCRYPTION_KEY` with `openssl rand -hex 32`.

Do not run multiple migration tasks at the same time. Keep at least one verified backup before any future destructive migration.

## New Neon account

Create the Neon project/database in the Neon dashboard, then replace both `DATABASE_URL` (pooled URL) and `DIRECT_URL` (direct URL) in the host's environment variables. The API creates the **schema** automatically at startup; it cannot create a new Neon project or database from a PostgreSQL connection string alone. Use `npm run start:prod`, not `node dist/main.js`, to retain automatic migrations.

At startup the terminal reports the status of Neon, ImageKit, and Resend. External-provider failures are shown as warnings and do not stop the API; PostgreSQL remains mandatory and prevents a production startup when unreachable.

## Frontend origin

Set CORS_ORIGINS=https://locationnovavolt.ca in the backend host. If you also serve the site through www.locationnovavolt.ca, add it as a comma-separated second origin. Once the API has its HTTPS URL, set VITE_API_BASE_URL=https://<api-host>/api/v1 in the frontend host and redeploy the frontend.

## Database

The initial migration enables the required PostgreSQL constraints for the rental workflow. The migration user must be allowed to create the required extension. The runtime user does not need schema-creation privileges.

Audit logs are protected by a trigger that blocks updates and deletes. Plan a retention policy before the table grows large.

## Private storage

- use a private, encrypted, versioned bucket;
- prefer workload IAM credentials over static keys;
- restrict access to the configured bucket and prefix;
- configure storage CORS only for the required web origin;
- call the malware-scan webhook after each upload;
- document retention and deletion policies.

## Stripe

Configure the webhook on:

```text
POST https://<api>/api/v1/payments/webhooks/stripe
```

Supported events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, and `charge.refunded`.

## Shutdown and rollback

The application handles `SIGTERM` with Nest shutdown hooks. If you roll back, only use an older release when its schema is still compatible with the already-applied migration. Fix a published migration with a new migration; do not edit a migration file that has already run in production.

## Minimum observability

- centralize structured HTTP logs;
- alert on `/health/ready` failures, 5xx responses, and webhook errors;
- monitor `FAILED` notifications, `ERROR` documents, `OVERDUE` invoices, and `OVERDUE` rentals;
- never log JWTs, secrets, full Stripe payloads, or presigned URLs.
