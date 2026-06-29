import { MetadataRoute } from 'next'
import { categories } from '@/data/tenders'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tenders.nasyhub.com'

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/ti`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/te`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/premium`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/tenders`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
  ]

  // Category pages
  const categoryPages = categories.map(cat => ({
    url: `${baseUrl}/tenders/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages]
}