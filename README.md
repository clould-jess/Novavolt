# ⚡ Novavolt — Plateforme de Location de Véhicules Électriques pour Chauffeurs & Particuliers au Canada

**Novavolt** est une application web moderne et haut de gamme dédiée à la location de véhicules 100 % électriques pour les chauffeurs professionnels VTC (*Uber, Lyft, Eva, Taxi*) et les particuliers au Canada.

---

## 🚀 Fonctionnalités Clés & Expérience Utilisateur

- **Navigation Moderne avec Dropdowns** : Menu principal épuré en 4 rubriques (*Nos Véhicules*, *Solutions & Offres*, *Ressources & Guides*, *Contact*) avec popovers fluides et lisibilité optimale sur mobile et ordinateur.
- **Statistiques Écologiques en Temps Réel** : Compteurs réactifs en direct (incrémentation continue par seconde des kilomètres parcourus et du CO₂ évité).
- **Simulateur d'Économies Interactif** : Curseur dynamique permettant aux chauffeurs de calculer leurs économies mensuelles nettes en passant du carburant à l'électrique.
- **Checklist Express 24h VTC** : Liste claire des 3 documents requis pour valider les demandes des chauffeurs professionnels (Permis, dossier de conduite, attestation Uber/Lyft).
- **Offre B2B Gestion de Flotte (`/flotte`)** : Espace dédié aux investisseurs et propriétaires de flottes souhaitant confier leurs véhicules électriques en gestion locative.
- **Blogue & Centre de Ressources SEO (`/blogue`)** : Articles, conseils de recharge et guides de rentabilité avec filtres et recherche en temps réel.
- **Internationalisation Multilingue (FR / EN)** : Prise en charge native du Français et de l'Anglais avec formatage automatique des devises, nombres et dates.
- **Gestion Épurée des Erreurs (Page 404)** : Page 404 intégrée au thème public avec barre de navigation, pied de page et redirection simple vers l'accueil.
- **Sécurisation des Pages Internes** : Masquage des routes de connexion et d'administration en production via un drapeau de contrôle (`ENABLE_INTERNAL_ROUTES`).

---

## 🛠️ Technologies Utilisées

| Domaine | Technologie |
| :--- | :--- |
| **Framework Frontend** | [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| **Outillage de Build** | [Vite](https://vitejs.dev/) |
| **Styling & CSS** | [Tailwind CSS](https://tailwindcss.com/) + PostCSS |
| **Animations & Interactions** | [Framer Motion](https://www.framer.com/motion/) |
| **Icônes** | [Lucide React](https://lucide.dev/) |
| **Routage** | [React Router DOM v6](https://reactrouter.com/) |
| **Internationalisation** | Context i18n sur mesure (`fr.json` & `en.json`) |

---

## 📁 Structure du Projet

```
Novavolt/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── home/           # Sections de la page d'accueil (Hero, Stats, SavingsCalculator, etc.)
│   │   │   ├── marketing/      # Composants génériques (Navbar, Footer, CtaBanner, RequiredDocumentsCard, etc.)
│   │   │   ├── ui/             # Composants de base UI (Button, Card, LiveCounter, SectionTitle, etc.)
│   │   │   ├── admin/          # Composants du tableau de bord administrateur (masqués en prod)
│   │   │   └── portal/         # Composants du portail client (masqués en prod)
│   │   ├── contexts/           # Contextes React (I18nContext, ToastContext)
│   │   ├── data/               # Données statiques (navigation, véhicules, blog, FAQ, etc.)
│   │   ├── messages/           # Dictionnaires de traduction (fr.json, en.json)
│   │   ├── pages/              # Pages principales (Home, Vehicles, Drivers, Fleet, Blog, NotFound, etc.)
│   │   ├── types/              # Déclarations de types TypeScript
│   │   └── utils/              # Fonctions utilitaires (formatage devises, dates, classes CSS)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## ⚙️ Installation et Lancement en Local

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- `npm` ou `yarn`

### Éapes

1. **Se rendre dans le dossier Frontend** :
   ```bash
   cd Frontend
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

   L'application sera accessible sur `http://localhost:5173`.

4. **Vérification du code TypeScript** :
   ```bash
   npx tsc --noEmit
   ```

5. **Compiler pour la production** :
   ```bash
   npm run build
   ```

---

## 🔐 Activation / Désactivation des Pages Connexion & Admin

Pour des raisons d'affichage public et de sécurité en production, les pages d'authentification (`/connexion`), de portail client (`/portail`) et d'administration (`/admin`) sont masquées par défaut.

Si vous souhaitez les réactiver pour le développement interne :
Open **`Frontend/src/App.tsx`** et changez la constante :
```typescript
const ENABLE_INTERNAL_ROUTES = true;
```

---

## 📄 Licence

Copyright © 2026 Novavolt Canada. Tous droits réservés.
