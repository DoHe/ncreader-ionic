import { Storage } from '@ionic/storage';
import itemsMock from '../mocks/items.json';
import foldersMock from '../mocks/folders.json';
import feedsMock from '../mocks/feeds.json';
import {
  syncDataKey, syncStatusKey, syncStatusSynced,
} from '@/constants';
import { Credentials, FeedStore, Item, useFeedsStore } from '@/store'

import { initialSync, subsequentSync } from './news';
import { ApiData } from './types';

function alphabetical(a: string, b: string) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

function sortData({ folders, feeds, items }: ApiData) {
  items.items.sort((left, right) => right.pubDate - left.pubDate);
  feeds.feeds.sort((left, right) => alphabetical(left.title, right.title));
  folders.folders.sort((left, right) => alphabetical(left.name, right.name));
}

function setDataInStore(store: FeedStore, { folders, feeds, items }: ApiData) {
  store.setItems(items.items, feeds.feeds);
  store.setFolders(folders.folders);
  store.setFeeds(feeds.feeds);
}

async function sync({
  mocked, credentials, startup = false,
}: { mocked: boolean, credentials: Credentials, startup: boolean }) {
  const storage = new Storage();
  await storage.create();

  const store = useFeedsStore()

  store.setSyncing(true);
  try {
    if (mocked) {
      const data: ApiData = {
        folders: foldersMock,
        feeds: feedsMock,
        items: itemsMock,
      };
      sortData(data);
      setDataInStore(store, data);
      return;
    }

    if (!(credentials.username
      && credentials.password
      && credentials.url)) {
      return;
    }

    let data: ApiData;
    const syncStatus = await storage.get(syncStatusKey);
    if (syncStatus === syncStatusSynced) {
      data = JSON.parse(await storage.get(syncDataKey));
      if (startup) {
        setDataInStore(store, data);
      }

      let lastModified = 0;
      data.items.items.forEach((item) => {
        if (item.lastModified > lastModified) {
          lastModified = item.lastModified;
        }
      });
      const newData = await subsequentSync(credentials, lastModified, data.feeds);
      if (!newData.items.items.length) {
        console.log('no items');
        return;
      }
      for (const oldItem of data.items.items) {
        let isUpdated = false;
        for (const newItem of newData.items.items) {
          if (oldItem.id === newItem.id) {
            isUpdated = true;
            break;
          }
        }
        if (!isUpdated) {
          newData.items.items.push(oldItem);
        }
      }
      newData.items.items = newData.items.items.filter((item: Item) => item.unread || item.starred);
      sortData(newData);
      newData.folders.folders = newData.folders.folders.length
        ? newData.folders.folders
        : data.folders.folders;
      newData.feeds.feeds = newData.feeds.feeds.length
        ? newData.feeds.feeds
        : data.feeds.feeds;
      storage.set(syncDataKey, JSON.stringify(newData));
      setDataInStore(store, newData);
    } else {
      data = await initialSync(credentials);
      if (!(data?.folders?.folders?.length > 0)) {
        return;
      }
      sortData(data);
      storage.set(syncDataKey, JSON.stringify(data));
      storage.set(syncStatusKey, syncStatusSynced);

      setDataInStore(store, data);
    }
  } finally {
    store.setSyncing(false);
  }
}

export default sync;
