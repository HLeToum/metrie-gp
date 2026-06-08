---
# === Guide de rédaction pour Claude Cowork ===
# Pour publier un article :
#   1. Copier ce fichier dans src/content/blog/<slug>.md
#      (le nom de fichier = l'URL : src/content/blog/scan-3d-patrimoine.md
#       devient https://metrie-gp.fr/blog/scan-3d-patrimoine)
#   2. Remplir les champs ci-dessous + rédiger le corps en Markdown.
#   3. Commit + push → Vercel rebuild automatiquement, l'article est en ligne.
#
# Les fichiers préfixés par "_" (comme celui-ci) sont IGNORÉS : ce template
# n'est jamais publié.
#
# --- Champs obligatoires ---
title: "Titre de l'article"
description: "Résumé d'une à deux phrases. Sert d'extrait dans la liste et de meta description SEO (≈ 150-160 caractères idéalement)."
pubDate: 2026-06-09   # format AAAA-MM-JJ

# --- Champs optionnels (supprimer les lignes inutiles) ---
# updatedDate: 2026-06-15
author: "Metrie GP"
# cover: /img/blog/mon-article.jpg     # image de couverture (déposer le fichier dans public/img/blog/)
# coverAlt: "Description de l'image pour l'accessibilité et le SEO"
tags: ["scan-3d", "guadeloupe"]
# keywords: "scan 3d, lidar, guadeloupe, scan-to-bim"
draft: true   # mettre false (ou supprimer) pour publier
---

## Sous-titre de section

Le corps de l'article s'écrit en **Markdown** standard.

- Listes à puces
- **gras**, *italique*, [liens](https://metrie-gp.fr)
- `code inline`

> Citation ou mise en avant.

### Sous-section

Paragraphe normal. Les titres `##` et `###` sont stylés automatiquement,
comme les liens, listes et blocs de code.
