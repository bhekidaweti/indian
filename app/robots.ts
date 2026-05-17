import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/admin/', '/dashboard/'],
    },
    sitemap: 'https://indianrestaurantnearme.co.za/sitemap.xml',
    host: 'https://indianrestaurantnearme.co.za',
  };
}