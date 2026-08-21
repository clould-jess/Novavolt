# NovaVolt Backend

API NestJS sécurisée pour les opérations de location de véhicules de NovaVolt.

## Fonctionnalités

- inscription, vérification d’adresse courriel et réinitialisation du mot de passe;
- authentification JWT avec sessions serveur et rotation atomique des jetons de renouvellement;
- rôles `CUSTOMER`, `AGENT`, `FLEET_MANAGER`, `ADMIN` et `OWNER`;
- flotte, candidatures, documents privés, réservations et locations;
- contrats, factures, paiements Stripe, dépôts, incidents et entretien;
- notifications sortantes par webhook signé, journal d’audit et tableau de bord;
- contrôles de concurrence PostgreSQL pour empêcher les doubles réservations;
- endpoints de santé, limitation de débit, validation stricte et journalisation corrélée.

## Prérequis

- Node.js 22+
- PostgreSQL 16+
- npm 10+

Stripe et un stockage S3 compatible sont optionnels en développement. Les fonctions correspondantes restent fermées tant que leur drapeau et leurs secrets ne sont pas configurés.

## Démarrage local

```bash
cp .env.example .env
docker compose up -d db
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed       # optionnel, après configuration de SEED_OWNER_*
npm run start:dev
```

API : `http://localhost:4000/api/v1`  
Swagger : `http://localhost:4000/docs` lorsque `ENABLE_SWAGGER=true`.

Pour lancer l’ensemble dans Docker :

```bash
docker compose --profile full up --build
```

Appliquez toujours les migrations avec `npm run prisma:deploy` avant de démarrer une nouvelle version de l’API.

## Vérification

```bash
npm run check
npm test
npm run test:e2e
npm run build
npm audit --audit-level=high
```

Les tests E2E fournis vérifient les endpoints de santé sans dépendre d’une base réelle. Une base PostgreSQL jetable est recommandée en CI pour les tests d’intégration métier et de concurrence.

## Configuration importante

Copiez `.env.example`, puis remplacez toutes les valeurs. En production :

- les deux secrets JWT doivent être différents, aléatoires et contenir au moins 64 caractères;
- les origines CORS doivent utiliser HTTPS;
- la vérification des courriels exige un adaptateur de notifications actif;
- les téléversements exigent un stockage privé et un analyseur antimalware;
- le paiement ne s’active qu’avec les deux secrets Stripe;
- les jetons de développement et Swagger sont désactivés par défaut.

`TRUST_PROXY_HOPS` doit correspondre exactement au nombre de mandataires de confiance devant l’application. Ne le mettez pas arbitrairement à une valeur élevée.

## Documentation

- [Carte de l’API](docs/API.md)
- [Déploiement](docs/DEPLOYMENT.md)
- [Architecture de sécurité](docs/SECURITY.md)
- [Liste de contrôle de production](docs/PRODUCTION-CHECKLIST.md)

## Licence

Logiciel propriétaire — tous droits réservés.
