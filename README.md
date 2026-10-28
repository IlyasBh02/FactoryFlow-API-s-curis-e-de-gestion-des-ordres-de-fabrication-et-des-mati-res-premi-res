# FactoryFlow

API REST de gestion de production pour une entreprise industrielle située à Safi. Elle centralise les produits, les matières premières, les stocks et les ordres de fabrication, et garantit des stocks fiables : avant de démarrer un ordre, l'API calcule les besoins, vérifie les stocks et enregistre les consommations.

> Projet individuel, backend uniquement (aucune interface frontend).

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Stack technique](#stack-technique)
3. [Architecture](#architecture)
4. [Prérequis](#prérequis)
5. [Configuration](#configuration)
6. [Démarrage avec Docker Compose](#démarrage-avec-docker-compose)
7. [Installation via l'API](#installation-via-lapi)
8. [Tests](#tests)
9. [Documentation de l'API](#documentation-de-lapi)
10. [Règles métier importantes](#règles-métier-importantes)
11. [Commandes utiles](#commandes-utiles)
12. [Dépannage](#dépannage)

## Fonctionnalités

**Admin**
- Se connecter, consulter son profil, créer les comptes des opérateurs.
- Gérer les matières premières (unité, seuil d'alerte), enregistrer les entrées de stock, consulter les mouvements.
- Gérer les produits et leur composition.
- Créer des ordres de fabrication, les affecter à un opérateur, modifier ou annuler les ordres encore planifiés.
- Consulter tous les ordres (filtres par statut, produit, période, avec pagination) et repérer les matières sous leur seuil d'alerte.

**Opérateur**
- Se connecter et consulter son profil.
- Consulter ses ordres affectés et leurs détails.
- Démarrer un ordre lorsque les matières sont disponibles, puis le terminer.
- Consulter l'historique de ses ordres terminés.

## Stack technique

| Élément | Technologie |
|---|---|
| Serveur | Node.js 20, Express |
| Base de données | MongoDB 7, Mongoose |
| Authentification | JWT, mots de passe hachés (bcrypt) |
| Tests | Jest |
| Qualité du code | ESLint |
| Conteneurs | Docker, Docker Compose |
| Documentation | Swagger / OpenAPI |

## Architecture

```
src/
├── config/         # variables d'environnement, connexion MongoDB
├── routes/         # définition des URLs
├── controllers/    # échanges HTTP (req / res) uniquement
├── services/       # règles métier
├── repositories/   # seuls accès à MongoDB
├── models/         # schémas Mongoose
├── middlewares/    # authentification, rôles, validation, erreurs
├── utils/          # outils (AppError, ...)
├── app.js          # configuration d'Express
└── server.js       # connexion à la base et lancement du serveur
```

Flux d'une requête : **route → contrôleur → service → repository → modèle**.

- Les **contrôleurs** gèrent uniquement HTTP.
- Les **services** portent les règles métier et ne dépendent pas d'Express.
- Les **repositories** regroupent tous les accès à MongoDB.
- Un **middleware global** transforme les erreurs en réponses JSON avec le bon code HTTP (400, 401, 403, 404, 409, 422, 500).

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose v2 (commande `docker compose`)
- Git
- Node.js 20 et npm (uniquement pour lancer ESLint ou les tests en dehors de Docker)

## Configuration

Les paramètres sensibles viennent des variables d'environnement. Aucun secret n'est présent dans le dépôt.

1. Copier le modèle :

   ```bash
   cp .env.example .env
   ```

2. Adapter les valeurs dans `.env` :

   | Variable | Description | Exemple |
   |---|---|---|
   | `PORT` | Port d'écoute de l'API | `3000` |
   | `NODE_ENV` | Environnement | `development` |
   | `MONGO_URI` | URI MongoDB | `mongodb://mongo:27017/factoryflow` |
   | `JWT_SECRET` | Secret de signature des JWT | valeur longue et aléatoire |
   | `JWT_EXPIRES_IN` | Durée de validité du token | `1d` |

   Pour générer un secret : `openssl rand -hex 32`.

> Dans Docker, `MONGO_URI` utilise le nom du service (`mongo`) et non `localhost`. Le fichier `compose.yaml` fournit cette valeur au conteneur.

## Démarrage avec Docker Compose

Une seule commande démarre le backend et MongoDB :

```bash
docker compose up --build
```

Ajouter `-d` pour lancer en arrière-plan :

```bash
docker compose up --build -d
```

Vérifier que l'API répond :

```bash
curl http://localhost:3000/api/health
# {"status":"ok"}
```

**Arrêter les services** (les données MongoDB sont conservées) :

```bash
docker compose down
```

**Repartir de zéro** (supprime aussi les données) :

```bash
docker compose down -v
```

### Points clés de l'environnement Docker

- **Rechargement sans rebuild** : le dossier du projet est monté dans le conteneur (bind mount) et le serveur tourne avec `nodemon`. Toute modification du code local est prise en compte immédiatement.
- **État de santé** : Docker vérifie périodiquement que l'API répond sur `/api/health`. `docker compose ps` indique si le backend est prêt.
- **Persistance** : un volume nommé (`mongo_data`) conserve les données MongoDB après l'arrêt et le redémarrage des conteneurs.
- **Dépendances** : après l'ajout d'un paquet npm, reconstruire avec `docker compose up --build --renew-anon-volumes`.
- **Replica set** : MongoDB est configuré en replica set à un nœud, ce qui est nécessaire aux transactions (installation, démarrage d'un ordre). *(À compléter après la configuration du replica set.)*

## Installation via l'API

Au premier lancement, aucun compte n'existe. L'installation crée le premier Admin.

**1. Vérifier l'état d'installation**

```bash
curl http://localhost:3000/api/installation/status
```

**2. Installer l'application** (possible une seule fois)

```bash
curl -X POST http://localhost:3000/api/installation \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@factoryflow.ma","password":"MotDePasse123!"}'
```

- Le mot de passe est haché avant d'être enregistré.
- Le compte Admin et l'état d'installation sont créés ensemble, ou pas du tout.
- Une seconde installation est refusée (`409`). Des données invalides sont refusées sans état partiel.

**3. Se connecter** *(route à compléter après l'implémentation de l'authentification)*

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@factoryflow.ma","password":"MotDePasse123!"}'
```

Utiliser ensuite le token reçu dans l'en-tête `Authorization: Bearer <token>`.

## Tests

Les tests unitaires portent sur les services, avec des repositories simulés (mocks) pour isoler les règles métier de MongoDB.

```bash
npm install
npm test
```

Avec Docker :

```bash
docker compose exec backend npm test
```

Avec rapport de couverture :

```bash
npm test -- --coverage
```

Cas couverts : calcul des besoins, stock insuffisant, démarrage réussi, second démarrage refusé, nouvelle installation refusée.

Vérifier le style du code :

```bash
npm run lint
```

## Documentation de l'API

La documentation Swagger / OpenAPI décrit les endpoints, les données, les erreurs et les permissions.

- Interface Swagger : `http://localhost:3000/api-docs` *(à compléter après la mise en place de Swagger)*
- Requêtes de démonstration : dossier `docs/` *(à compléter)*

## Règles métier importantes

- Les références des produits et des matières premières sont **uniques**.
- Les quantités de composition, d'entrée de stock et de fabrication sont **strictement positives** ; le stock initial et le seuil peuvent être nuls.
- Un produit utilise **au moins une matière existante**, sans doublon dans sa composition.
- Un ordre garde une **copie de la composition** du produit à sa création.
- Statuts : `planifié → en cours → terminé`. Seul un ordre planifié peut être annulé.
- **Démarrage d'un ordre** : besoins = composition unitaire × quantité à fabriquer.
  - Si une matière manque : démarrage refusé, aucune quantité déduite.
  - Sinon : toutes les matières sont déduites, les mouvements de sortie sont enregistrés et le statut passe à « en cours », **dans une seule transaction**.
  - Un second démarrage du même ordre est refusé et ne déduit pas le stock une nouvelle fois.
- Un opérateur ne peut ni exécuter une action Admin, ni consulter ou modifier les ordres d'un autre opérateur.

**Exemple** : un produit nécessite 2 kg de A et 3 unités de B. Pour fabriquer 10 produits, l'API vérifie la disponibilité de 20 kg de A et de 30 unités de B avant de démarrer l'ordre.

## Commandes utiles

| Commande | Rôle |
|---|---|
| `docker compose up --build -d` | Construire et démarrer les services en arrière-plan |
| `docker compose ps` | Afficher l'état des conteneurs |
| `docker compose logs -f backend` | Suivre les logs du backend |
| `docker compose down` | Arrêter les services (données conservées) |
| `docker compose down -v` | Arrêter et supprimer les données |
| `npm run dev` | Lancer l'API avec nodemon (hors Docker) |
| `npm run lint` | Analyser le code avec ESLint |
| `npm test` | Lancer les tests unitaires |



## Auteur

Projet réalisé dans le cadre de la formation *Conception et développement de services backend sécurisés*.