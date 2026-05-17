// Central source of truth for site-wide constants (SEO, business info,
// areas served). Edit here, not in individual pages.

export const site = {
  url: "https://metrie-gp.fr",
  name: "Metrie GP",
  legalName: "Metrie GP SAS",
  tagline: "Scan 3D LiDAR & Scan-to-BIM en Guadeloupe",
  description:
    "Studio de scan 3D LiDAR et Scan-to-BIM basé en Guadeloupe. Relevés haute précision pour le bâtiment, l'industrie, l'ingénierie et le patrimoine — interventions dans toutes les Antilles françaises.",
  locale: "fr-FR",
  founder: "Luidgi DRACON",
  email: "contact@metrie-gp.fr",
  phone: "+33-6-00-00-00-00",
  phoneDisplay: "+33 (0)6 00 00 00 00",
  address: {
    street: "2 Rue Gédéon",
    postalCode: "97190",
    locality: "Le Gosier",
    region: "Guadeloupe",
    country: "FR",
    countryName: "France",
  },
  capital: "3 000 €",
  rcs: "Pointe-à-Pitre",
  rcsNumber: "104 330 014",
  siren: "104330014",
  vat: "FR57104330014",
  ape: "71.12B",
  apeLabel: "Ingénierie, études techniques",
  legalForm: "Société par Actions Simplifiée (SAS)",
  legalFormCode: "5710",
  creationDate: "2026-04-28",
  ogImage: "/img/scanner.png",
} as const;

export type Territory = {
  slug: string;
  name: string;
  region: string;
  postalRange: string;
  prefecture: string;
  population: string;
  keyCities: readonly string[];
  insee: string;
  blurb: string;
};

export const territories: readonly Territory[] = [
  {
    slug: "guadeloupe",
    name: "Guadeloupe",
    region: "Guadeloupe",
    postalRange: "971",
    prefecture: "Basse-Terre",
    population: "~384 000 habitants",
    keyCities: [
      "Pointe-à-Pitre",
      "Les Abymes",
      "Baie-Mahault",
      "Le Gosier",
      "Sainte-Anne",
      "Saint-François",
      "Basse-Terre",
      "Saint-Claude",
      "Petit-Bourg",
      "Lamentin",
      "Capesterre-Belle-Eau",
      "Morne-à-l’Eau",
    ],
    insee: "01",
    blurb:
      "Notre territoire de base. Intervention sous 48 h en Grande-Terre, Basse-Terre, Marie-Galante, Les Saintes et La Désirade — du bâti colonial créole au bâti industriel de la zone de Jarry.",
  },
  {
    slug: "martinique",
    name: "Martinique",
    region: "Martinique",
    postalRange: "972",
    prefecture: "Fort-de-France",
    population: "~360 000 habitants",
    keyCities: [
      "Fort-de-France",
      "Le Lamentin",
      "Schœlcher",
      "Sainte-Marie",
      "Le Robert",
      "Le François",
      "Ducos",
      "Rivière-Salée",
      "Trinité",
      "Saint-Pierre",
    ],
    insee: "02",
    blurb:
      "Intervention régulière en Martinique : zones portuaires du Lamentin, patrimoine bâti de Saint-Pierre, ouvrages d'art et infrastructures touristiques du sud caraïbe.",
  },
  {
    slug: "saint-martin",
    name: "Saint-Martin",
    region: "Saint-Martin",
    postalRange: "97150",
    prefecture: "Marigot",
    population: "~32 000 habitants",
    keyCities: [
      "Marigot",
      "Grand-Case",
      "Quartier d’Orléans",
      "Sandy Ground",
      "La Savane",
    ],
    insee: "78",
    blurb:
      "Reconstruction post-Irma toujours en cours : relevés d’existant pour réhabilitation, état des lieux assurantiel par scan 3D, dossiers de permis sur îles.",
  },
  {
    slug: "saint-barthelemy",
    name: "Saint-Barthélemy",
    region: "Saint-Barthélemy",
    postalRange: "97133",
    prefecture: "Gustavia",
    population: "~10 000 habitants",
    keyCities: [
      "Gustavia",
      "Saint-Jean",
      "Lorient",
      "Grand Cul-de-Sac",
      "Anse des Cayes",
    ],
    insee: "77",
    blurb:
      "Marché haut de gamme : villas d’architecte, hôtellerie de luxe, propriétés privées exigeant des relevés d’existant non intrusifs et hautement précis.",
  },
  {
    slug: "guyane",
    name: "Guyane",
    region: "Guyane",
    postalRange: "973",
    prefecture: "Cayenne",
    population: "~290 000 habitants",
    keyCities: [
      "Cayenne",
      "Saint-Laurent-du-Maroni",
      "Kourou",
      "Matoury",
      "Rémire-Montjoly",
    ],
    insee: "03",
    blurb:
      "Industriels et acteurs spatiaux du Centre Spatial Guyanais : scan d’installations techniques, relevés en milieu équatorial humide, jumeaux numériques de sites en exploitation.",
  },
] as const;

export const services = [
  {
    slug: "releve-topographique",
    name: "Relevé topographique & architectural",
    short:
      "Plans 2D, coupes, façades, MNT à partir d’un nuage de points géoréférencé.",
  },
  {
    slug: "scan-to-bim",
    name: "Scan-to-BIM Revit · ArchiCAD · IFC",
    short: "Maquette numérique fidèle à l’existant, du LOD 200 au LOD 400.",
  },
  {
    slug: "patrimoine-jumeau-numerique",
    name: "Patrimoine & jumeau numérique",
    short:
      "Numérisation du bâti historique antillais et jumeaux numériques industriels.",
  },
] as const;

export const navLinks = [
  { href: "/", label: "Accueil" },
  // { href: '/demo', label: 'Démo 3D' },
  // { href: '/outils', label: 'Nos outils' },
  { href: "/portfolio", label: "Portfolio" },
] as const;
