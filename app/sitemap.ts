import { MetadataRoute } from 'next';
import { client } from '@/lib/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.jgda.or.jp';

    // 基本的な固定ページ
    const routes = [
        '',
        '/about',
        '/news',
        '/entry',
        '/results',
        '/photos',
        '/players',
        '/videos',
        '/spectate',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
    }));

    // 動的ページ (News)
    const newsRes = await client.get({
        endpoint: 'news',
        queries: { limit: 100 },
    }).catch(() => ({ contents: [] }));

    const newsRoutes = newsRes.contents.map((news: any) => ({
        url: `${baseUrl}/news/${news.id}`,
        lastModified: new Date(news.updatedAt || news.publishedAt),
    }));

    // 動的ページ (Players)
    const playersRes = await client.get({
        endpoint: 'players',
        queries: { limit: 100 },
    }).catch(() => ({ contents: [] }));

    const playerRoutes = playersRes.contents.map((player: any) => ({
        url: `${baseUrl}/players/${player.id}`,
        lastModified: new Date(player.updatedAt || player.publishedAt),
    }));

    return [...routes, ...newsRoutes, ...playerRoutes];
}
