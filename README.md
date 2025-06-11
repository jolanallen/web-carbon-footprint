# 🌍 Web Carbon Footprint

Un projet simple pour estimer et sensibiliser à l'empreinte carbone des sites web, en s'appuyant sur un modèle d'IA génératif (Gemini) pour produire des réponses contextualisées.

## 🚀 Fonctionnalités

* Envoi d'une URL à l'API
* Utilisation de Gemini Flash pour générer des explications sur l’impact environnemental du site
* Frontend interactif
* Serveur Node.js simple et léger

## 🛠️ Installation

### Prérequis

* Node.js >= 18
* Une **clé API Google Generative Language (Gemini)**

### Étapes

1. **Cloner le dépôt**

```bash
git clone https://github.com/jolanallen/web-carbon-footprint.git
cd web-carbon-footprint
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Remplacer la clé API**

Dans le fichier [`server.js`](server.js), **ligne 54**, remplace :

```js
const apiKey = "your_api_key";
```

par :

```js
const apiKey = "VOTRE_CLEF_API_PERSONNELLE";
```

Tu peux obtenir une clé API ici : [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

> ⚠️ **Ne partage jamais ta clé API publiquement**.

4. **Lancer le serveur**

```bash
node server.js
```

5. Ouvre le navigateur à l'adresse : [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
web-carbon-footprint/
│
├── public/             → Fichiers statiques HTML/CSS/JS
├── server.js           → Serveur Node.js
├── package.json        → Dépendances et configuration
```


