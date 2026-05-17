import { site, services, territories } from '../siteConfig';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    email: site.email,
    telephone: site.phone,
    image: new URL(site.ogImage, site.url).toString(),
    logo: new URL(site.ogImage, site.url).toString(),
    founder: { '@type': 'Person', name: site.founder },
    foundingDate: site.creationDate,
    foundingLocation: {
      '@type': 'Place',
      name: 'Le Gosier, Guadeloupe',
    },
    taxID: site.siren,
    vatID: site.vat,
    naics: site.ape,
    identifier: [
      { '@type': 'PropertyValue', propertyID: 'SIREN', value: site.siren },
      { '@type': 'PropertyValue', propertyID: 'RCS', value: `${site.rcsNumber} R.C.S. ${site.rcs}` },
      { '@type': 'PropertyValue', propertyID: 'VAT', value: site.vat },
      { '@type': 'PropertyValue', propertyID: 'APE', value: site.ape },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 16.215,
      longitude: -61.493,
    },
    areaServed: territories.map((t) => ({
      '@type': 'AdministrativeArea',
      name: t.name,
    })),
    serviceType: services.map((s) => s.name),
    knowsAbout: [
      'Scan 3D LiDAR',
      'Scan-to-BIM',
      'Nuage de points',
      'Relevé topographique',
      'Modélisation BIM Revit',
      'Modélisation ArchiCAD',
      'Jumeau numérique industriel',
      'Numérisation du patrimoine',
      'FJD Trion P2',
    ],
    sameAs: [],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services Metrie GP',
      itemListElement: services.map((s, i) => ({
        '@type': 'Offer',
        position: i + 1,
        itemOffered: {
          '@type': 'Service',
          name: s.name,
          description: s.short,
          provider: { '@id': `${site.url}/#organization` },
        },
      })),
    },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: site.url,
    name: site.name,
    description: site.description,
    publisher: { '@id': `${site.url}/#organization` },
    inLanguage: 'fr-FR',
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: new URL(it.path, site.url).toString(),
    })),
  };
}

export function faqSchema(qa: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function serviceSchema(s: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    description: s.description,
    url: new URL(s.path, site.url).toString(),
    provider: { '@id': `${site.url}/#organization` },
    areaServed: territories.map((t) => ({ '@type': 'AdministrativeArea', name: t.name })),
  };
}
