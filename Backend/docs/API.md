# Carte de l’API

Préfixe : `/api/v1`

Les routes protégées utilisent `Authorization: Bearer <accessToken>`. Les listes paginées acceptent `page` et `limit` (maximum 100). Swagger expose les DTO exacts à `/docs` lorsqu’il est activé.

## Routes publiques

| Méthode | Route | Usage |
|---|---|---|
| GET | `/health`, `/health/live` | Vivacité du processus |
| GET | `/health/ready` | Disponibilité de PostgreSQL |
| GET | `/vehicles`, `/vehicles/:id`, `/vehicles/:vehicleId/photos/:photoId` | Catalogue et URL de photo sans VIN ni plaque |
| POST | `/auth/register` | Créer un compte client |
| POST | `/auth/login`, `/auth/refresh` | Ouvrir ou renouveler une session |
| POST | `/auth/email-verification/request`, `/confirm` | Vérifier un courriel |
| POST | `/auth/password-reset/request`, `/confirm` | Réinitialiser un mot de passe |
| POST | `/payments/webhooks/stripe` | Webhook Stripe à signature obligatoire |
| POST | `/internal/document-scans/:id` | Résultat antimalware à signature HMAC obligatoire |
| POST | `/internal/vehicle-photo-scans/:id` | Résultat antimalware d’une photo à signature HMAC obligatoire |

Les demandes de vérification et de réinitialisation retournent volontairement une réponse générique pour éviter l’énumération de comptes.

## Client authentifié

| Domaine | Routes principales |
|---|---|
| Compte | `GET /users/me`, `PATCH /users/me/profile` |
| Sessions | `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `POST /auth/logout`, `/logout-all`, `/change-password` |
| Candidatures | `POST /applications`, `GET /applications/me`, `POST /applications/:id/cancel` |
| Documents | `GET /documents/me`, `POST /documents/upload`, `POST /documents/:id/complete`, `GET /documents/:id/download` |
| Réservations | `GET /bookings/me`, `POST /bookings`, `POST /bookings/:id/cancel` |
| Locations | `GET /rentals/me` |
| Contrats | `GET /contracts/me`, `GET /contracts/:id/download` |
| Factures | `GET /invoices/me` |
| Paiements | `GET /payments/me`, `POST /payments/invoices/:invoiceId/intent` |
| Incidents | `GET /incidents/me`, `POST /incidents` |
| Notifications | `GET /notifications/me`, `PATCH /notifications/:id/read` |

La création d’un PaymentIntent exige l’en-tête `Idempotency-Key`, composé de 8 à 255 caractères parmi `A-Z`, `a-z`, `0-9`, `.`, `_`, `:`, `-`. Seul le `clientSecret` Stripe est retourné; aucune donnée de carte n’est reçue ou conservée par l’API.

## Personnel et administration

| Domaine | Rôles | Routes principales |
|---|---|---|
| Candidatures | Agent, admin, owner | `GET /applications`, `PATCH /applications/:id/review` |
| Documents | Agent, admin, owner | `GET /documents/staff`, `PATCH /documents/:id/review` |
| Réservations | Agent, fleet manager, admin, owner | `GET /bookings/staff`, `PATCH /bookings/:id/review` |
| Locations | Fleet manager, admin, owner | `GET /rentals/staff`, `POST /rentals/activate`, statuts et dépôts |
| Flotte | Fleet manager, admin, owner | `GET /vehicles/staff`, création, mises à jour et téléversement/suppression des photos |
| Entretien | Fleet manager, admin, owner | `GET/POST/PATCH /maintenance` |
| Incidents | Agent, fleet manager, admin, owner | `GET /incidents/staff`, `PATCH /incidents/:id` |
| Contrats | Agent, admin, owner | téléversement, finalisation et signature |
| Factures | Agent en lecture; admin/owner en écriture | liste, création et annulation |
| Administration | Admin, owner | `/admin/dashboard`, utilisateurs et statuts |
| Rôles | Owner seulement | `PATCH /admin/users/:id/role` |
| Audit | Admin, owner | `GET /audit` |

Le système empêche la désactivation de son propre compte, la modification de son propre rôle et la rétrogradation du dernier propriétaire.

## Téléversements signés

1. Le client demande une URL avec `POST /documents/upload`.
2. Il envoie exactement le type MIME, la taille et les en-têtes retournés vers l’URL S3 signée.
3. Il confirme avec `POST /documents/:id/complete`.
4. L’analyseur envoie son verdict signé à `/internal/document-scans/:id`.
5. Un agent ne peut approuver le document qu’après un verdict `CLEAN` lorsque l’analyse est obligatoire.

Signature de l’analyseur :

```text
hex(HMAC-SHA256(MALWARE_SCANNER_WEBHOOK_SECRET,
  "<timestampUnix>.<documentId>.<CLEAN|INFECTED|ERROR>"))
```

En-têtes : `x-scanner-timestamp` et `x-scanner-signature`. La fenêtre acceptée est de cinq minutes.

## Webhook de notifications

Le worker envoie un JSON vers `NOTIFICATION_WEBHOOK_URL` avec :

```text
x-novavolt-timestamp: <timestampUnix>
x-novavolt-signature: hex(HMAC-SHA256(secret, "<timestamp>.<corpsJSON>"))
```

Une réponse HTTP 2xx confirme la livraison. Le corps peut contenir `{ "providerId": "..." }`. Le worker réessaie au maximum cinq fois.

## Erreurs et traçabilité

Chaque réponse expose `x-request-id`; le client peut fournir une valeur conforme pour corréler ses journaux. Les erreurs Prisma publiques sont traduites en messages génériques et ne divulguent ni requêtes ni détails de schéma.
