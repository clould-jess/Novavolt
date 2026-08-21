# Déploiement

## Ordre recommandé

1. Créer une base PostgreSQL 16 privée avec sauvegardes et restauration ponctuelle.
2. Créer un utilisateur applicatif limité à la base NovaVolt.
3. Configurer les secrets et variables depuis `.env.example` dans un gestionnaire de secrets.
4. Construire une image immuable avec `docker build -t novavolt-api:<version> .`.
5. Exécuter `npm run prisma:deploy` comme tâche de livraison unique.
6. Déployer l’API derrière un répartiteur TLS avec `/api/v1/health/ready` comme sonde.
7. Tester l’inscription, la notification, le téléversement, le verdict antimalware et un paiement Stripe en mode test.

Générez `NOTIFICATION_PAYLOAD_ENCRYPTION_KEY` avec `openssl rand -hex 32`. Sa perte empêche la livraison des notifications déjà en attente; sa rotation doit donc prévoir le drainage de la file ou une migration des enveloppes.

Ne lancez pas plusieurs tâches de migration concurrentes. Conservez au moins une sauvegarde vérifiée avant toute migration destructive future.

## Base de données

La migration initiale active `btree_gist`, ajoute des contraintes métier et une contrainte d’exclusion PostgreSQL sur les réservations approuvées. L’utilisateur qui exécute la migration doit pouvoir créer cette extension. L’utilisateur d’exécution quotidien n’a pas besoin de droits de création de schéma.

Les journaux d’audit sont protégés par un déclencheur qui refuse leur modification ou suppression. Définissez une politique d’archivage conforme avant que la table ne devienne volumineuse; ne contournez pas le déclencheur depuis l’application.

## Stockage privé

- utilisez un compartiment non public, chiffré et versionné;
- préférez un rôle IAM de charge de travail aux clés statiques;
- limitez ce rôle au préfixe et au compartiment configurés;
- configurez CORS du stockage uniquement pour le domaine web nécessaire;
- faites appeler le webhook HMAC par votre pipeline d’analyse après chaque téléversement;
- appliquez une règle de rétention et une politique de suppression documentée.

## Stripe

Configurez le webhook sur :

```text
POST https://<api>/api/v1/payments/webhooks/stripe
```

Événements gérés : `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled` et `charge.refunded`. Conservez la vérification de signature sur le corps brut et utilisez un secret distinct par environnement.

## Arrêt, démarrage et retour arrière

L’application écoute `SIGTERM` grâce aux hooks d’arrêt NestJS. Lors d’un retour arrière, ne revenez à une ancienne image que si son schéma est compatible avec la migration déjà appliquée. Corrigez une migration publiée avec une nouvelle migration; ne modifiez pas un fichier de migration qui a déjà été exécuté en production.

## Observabilité minimale

- centraliser les sorties structurées HTTP;
- alerter sur les échecs `/health/ready`, les réponses 5xx et les webhooks en erreur;
- surveiller les notifications `FAILED`, documents `ERROR`, factures `OVERDUE` et locations `OVERDUE`;
- ne jamais journaliser les JWT, secrets, corps Stripe complets ou URL présignées.
