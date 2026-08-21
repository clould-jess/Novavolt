# Liste de contrôle de production

## Secrets et identité

- [ ] Secrets JWT distincts, aléatoires, de 64 caractères ou plus, stockés hors du dépôt.
- [ ] `EXPOSE_DEVELOPMENT_TOKENS=false` et `ENABLE_SWAGGER=false`.
- [ ] Vérification du courriel testée avec le webhook de notifications.
- [ ] MFA imposé aux agents, gestionnaires, administrateurs et propriétaires.
- [ ] Procédure de rotation et de révocation des secrets testée.

## Réseau et plateforme

- [ ] TLS de bout en bout, HSTS et origine CORS exacte.
- [ ] `TRUST_PROXY_HOPS` égal au nombre réel de proxys de confiance.
- [ ] Base et stockage non publics, pare-feu/WAF et limitation de débit en bordure.
- [ ] Conteneur exécuté sans privilèges et système de fichiers en lecture seule si possible.
- [ ] Sondes `/health/live` et `/health/ready` configurées séparément.

## Données

- [ ] Utilisateur PostgreSQL de moindre privilège et extension `btree_gist` autorisée pour la migration.
- [ ] Sauvegardes automatiques, restauration ponctuelle et exercice de restauration réussis.
- [ ] Chiffrement en transit et au repos vérifié.
- [ ] Rétention, suppression et accès aux pièces d’identité approuvés juridiquement au Québec/Canada.
- [ ] Export et conservation du journal d’audit définis.

## Intégrations

- [ ] Compartiment S3 privé, versionné, chiffré, CORS restreint et IAM minimal.
- [ ] Analyse antimalware réelle active; fichiers infectés supprimés/quarantainés.
- [ ] Stripe en mode production, webhook signé et alertes sur événements non traités.
- [ ] Webhook de notifications HTTPS, secret HMAC et traitement idempotent côté adaptateur.
- [ ] Secrets et comptes externes distincts pour développement, préproduction et production.

## Qualité et exploitation

- [ ] `npm ci`, `npm run check`, tests unitaires/E2E, build et audit de dépendances réussis en CI.
- [ ] Tests d’intégration PostgreSQL couvrant concurrence de réservation et rotation de session.
- [ ] Analyse SAST, secrets et image de conteneur activée en CI.
- [ ] Journaux centralisés avec expurgation des jetons, PII et URL présignées.
- [ ] Alertes sur 5xx, disponibilité DB, paiements, notifications et tâches planifiées.
- [ ] Plan de réponse à incident, restauration et retour arrière répété avant lancement.
