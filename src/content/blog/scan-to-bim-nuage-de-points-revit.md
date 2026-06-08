---
title: "Scan-to-BIM : du nuage de points à la maquette Revit"
description: "Comment un nuage de points brut devient une maquette numérique exploitable. Étapes, niveaux de détail (LOD) et pièges à éviter."
pubDate: 2026-06-05
tags: ["scan-to-bim", "methode", "revit"]
keywords: "scan-to-bim, nuage de points, revit, archicad, LOD, maquette numérique, BIM"
---

Le « Scan-to-BIM » sonne comme un bouton magique. En réalité, c'est un travail de
modélisation rigoureux, où le nuage de points sert de **vérité terrain** sur
laquelle on reconstruit une maquette intelligente.

## Étape 1 — Le nuage géoréférencé

Tout part d'un nuage de points propre : recalé, nettoyé des parasites (passants,
véhicules, réflexions) et géoréférencé. Un mauvais nuage condamne toute la suite.

## Étape 2 — La modélisation

On reconstruit dans Revit ou ArchiCAD les éléments réels : murs, dalles,
poteaux, menuiseries, réseaux. Chaque objet est **calé sur le nuage**, pas
dessiné « à peu près ».

## Comprendre les niveaux de détail (LOD)

Le LOD définit **jusqu'où on modélise**. C'est le curseur prix / précision le
plus important du projet.

- **LOD 200** — volumes génériques. Idéal pour une étude de faisabilité.
- **LOD 300** — géométrie fidèle et dimensions exactes. Le standard pour la
  conception et le permis.
- **LOD 350 / 400** — interfaces entre éléments, détails de fabrication. Pour
  l'exécution et la préfabrication.

> Demander du LOD 400 partout « pour être tranquille » fait exploser le budget
> sans servir le projet. Le bon réflexe : adapter le LOD pièce par pièce.

## Les pièges classiques

1. **Modéliser ce qui ne sera jamais utilisé** — chaque objet coûte. On modélise
   selon l'usage, pas par perfectionnisme.
2. **Oublier la tolérance du bâti ancien** — un mur créole n'est ni droit ni
   d'aplomb. La maquette doit refléter le réel, pas l'idéaliser.
3. **Perdre le lien au nuage** — garder le nuage attaché à la maquette permet de
   vérifier et de re-modéliser plus tard.

## Le livrable

Au final : une maquette IFC ouverte, exploitable par tous les corps d'état, plus
les plans 2D, coupes et façades extraits automatiquement. La donnée terrain
devient un **actif réutilisable** pour toute la vie du bâtiment.

Un projet de réhabilitation ou d'extension en vue ?
[Parlons-en](/contact).
