import { Credentials, Feed } from '@/store';
import { Buffer } from 'buffer';
import { ApiData } from './types';

const feedsUrl = (baseUrl: string) => (`${baseUrl}/index.php/apps/news/api/v1-3/feeds`);
const unreadItemsUrl = (baseUrl: string) => (`${baseUrl}/index.php/apps/news/api/v1-3/items?type=3&getRead=false&batchSize=-1`);
const starredItemsUrl = (baseUrl: string) => (`${baseUrl}/index.php/apps/news/api/v1-3/items?type=2&getRead=true&batchSize=-1`);
const updateItemsUrl = (baseUrl: string, lastModified: number) => (
  `${baseUrl}/index.php/apps/news/api/v1-3/items/updated?lastModified=${lastModified}&type=3`
);
const foldersUrl = (baseUrl: string) => (`${baseUrl}/index.php/apps/news/api/v1-3/folders`);
const markUrl = (baseUrl: string, id: number, method: string) => (`${baseUrl}/index.php/apps/news/api/v1-3/items/${id}/${method}`);

function authHeaders({ username, password }: { username?: string, password?: string }) {
  const headers = new Headers();
  headers.set('Authorization', `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`);
  return headers;
}

async function initialSync(credentials: Credentials): Promise<ApiData> {
  let { url } = credentials;
  url = url as string;
  const headers = authHeaders(credentials);

  const calls = [
    fetch(foldersUrl(url), { headers }),
    fetch(feedsUrl(url), { headers }),
    fetch(unreadItemsUrl(url), { headers }),
    fetch(starredItemsUrl(url), { headers }),
  ];

  try {
    const resolvedCalls = await Promise.all(calls);
    const jsons = await Promise.all(resolvedCalls.map((call) => call.json()));
    const [folders, feeds, items, itemsStarred] = jsons;
    return { folders, feeds, items: { items: [...items.items, ...itemsStarred.items] } };
  } catch (error) {
    console.error(error);
    return {
      folders: { folders: [] },
      feeds: { feeds: [] },
      items: { items: [] },
    };
  }
}

async function subsequentSync(credentials: Credentials, lastModified: number, oldFeeds: { feeds: Array<Feed> }) {
  let { url } = credentials;
  url = url as string;
  const headers = authHeaders(credentials);

  const feedIds = oldFeeds.feeds.map((feed) => feed.id);

  let items = [];
  try {
    const itemsResponse = await fetch(updateItemsUrl(url, lastModified), { headers });
    items = await itemsResponse.json();
  } catch (error) {
    console.error(error);
    return {
      folders: { folders: [] },
      feeds: { feeds: [] },
      items: { items: [] },
    };
  }

  let needFullSync = false;
  for (const { feedId } of items.items) {
    if (!feedIds.includes(feedId)) {
      needFullSync = true;
      break;
    }
  }

  if (!needFullSync) {
    return { items, folders: { folders: [] }, feeds: { feeds: [] } };
  }

  const calls = [
    fetch(foldersUrl(url), { headers }),
    fetch(feedsUrl(url), { headers }),
  ];

  try {
    const resolvedCalls = await Promise.all(calls);
    const jsons = await Promise.all(resolvedCalls.map((call) => call.json()));
    const [folders, feeds] = jsons;
    return { folders, feeds, items };
  } catch (error) {
    console.error(error);
    return {
      folders: { folders: [] },
      feeds: { feeds: [] },
      items: { items: [] },
    };
  }
}

function markItem({ id, credentials, method }: { id: number, credentials: Credentials, method: string }) {
  let { url } = credentials;
  url = url as string;
  const headers = authHeaders(credentials);

  return fetch(markUrl(url, id, method), { method: 'POST', headers });
}

function starItem({ id, credentials }: { id: number, credentials: Credentials }) {
  markItem({ id, credentials, method: 'star' });
}

function unstarItem({ id, credentials }: { id: number, credentials: Credentials }) {
  markItem({ id, credentials, method: 'unstar' });
}

function readItem({ id, credentials }: { id: number, credentials: Credentials }) {
  markItem({ id, credentials, method: 'read' });
}

export {
  initialSync, subsequentSync, readItem, starItem, unstarItem,
};
