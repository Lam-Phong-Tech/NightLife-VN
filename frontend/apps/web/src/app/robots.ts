import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/tai-khoan', '/dat-cho', '/lich-su-dat-cho'],
    },
    sitemap: 'https://nightlife.hn/sitemap.xml',
  };
}
