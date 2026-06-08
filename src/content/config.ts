import { defineCollection, z } from 'astro:content';

// Blog collection — the "contract" Claude Cowork writes against.
// Drop a Markdown file in src/content/blog/<slug>.md with the frontmatter
// below and commit; Vercel rebuilds and the article goes live.
// See src/content/blog/_template.md for a ready-to-copy skeleton.
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    // Required
    title: z.string(),
    description: z.string(), // résumé SEO + extrait affiché dans la liste
    pubDate: z.coerce.date(), // format : 2026-06-09

    // Optional
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Metrie GP'),
    cover: z.string().optional(), // chemin public, ex : /img/blog/mon-article.jpg
    coverAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    keywords: z.string().optional(), // meta keywords SEO (optionnel)
    draft: z.boolean().default(false), // true = visible en local, masqué en prod
  }),
});

export const collections = { blog };
