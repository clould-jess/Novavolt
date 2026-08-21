# Architecture de sécurité

## Identité et sessions

Les mots de passe sont hachés avec Argon2id. Les JWT d’accès sont courts et rattachés à une session persistée; une session révoquée cesse donc immédiatement d’autoriser les accès. Les jetons de renouvellement tournent atomiquement et leur réutilisation révoque la session. Les jetons de vérification et de réinitialisation sont aléatoires et à usage unique; l’index de validation n’est stocké que sous forme de condensat et la copie temporaire nécessaire à la livraison est chiffrée avec AES-256-GCM dans la file de notifications.

Les comptes sont verrouillés temporairement après des échecs répétés. Les réponses d’authentification restent génériques afin de réduire l’énumération de comptes. L’ajout de MFA reste obligatoire pour les rôles internes avant une utilisation à risque élevé.

## Autorisation

Chaque route métier protégée combine validation JWT et contrôle des rôles. Les services refont les contrôles de propriété sur les documents, contrats, factures, paiements et ressources client. Les informations sensibles d’un véhicule — VIN et plaque — ne figurent pas dans le catalogue public.

## Fichiers

L’API ne reçoit pas les octets : elle génère des clés non choisies par le client et des URL présignées courtes. Elle vérifie ensuite la taille et le type MIME déclarés par le stockage. Le chiffrement S3 AES-256 est imposé et l’approbation peut être bloquée jusqu’au verdict antimalware. La validation de contenu réelle appartient au service d’analyse connecté au webhook HMAC.

## Paiements

NovaVolt ne collecte ni ne conserve de numéro de carte. Stripe héberge les moyens de paiement; l’API conserve uniquement des identifiants fournisseur, montants et statuts. Les créations sont idempotentes, les événements entrants sont signés et leur identifiant est unique en base.

## Intégrité métier

Les transitions de réservation et location utilisent des transactions et des verrous de ligne. PostgreSQL impose en dernier recours l’absence de chevauchement des réservations approuvées et l’unicité d’une location ouverte par véhicule. Des contraintes vérifient aussi les montants, dates et kilométrages.

## Journal d’audit

Les mutations privilégiées écrivent un événement avec acteur, cible, métadonnées contrôlées et contexte de requête. La base interdit la modification ou suppression de ces événements. L’audit ne remplace pas une solution centralisée de journaux inviolables; exportez-le selon votre politique de conservation.

## Modèle de confiance externe

Les frontières externes sont PostgreSQL, Stripe, le stockage S3, l’analyseur antimalware et l’adaptateur de notifications. Chaque intégration est désactivée par défaut et échoue fermée sans sa configuration. Utilisez TLS, des secrets séparés par environnement, la rotation, des permissions minimales et des restrictions réseau.

## Signalement

Ne publiez pas de vulnérabilité avec des données réelles dans un ticket public. Transmettez au responsable sécurité de NovaVolt une reproduction minimale, l’impact, la version et les journaux expurgés.
