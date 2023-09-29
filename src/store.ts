import { defineStore } from 'pinia'

type Folder = {
  id: number,
  name: string,
}

type Feed = {
  id: number,
  url: string,
  title: string,
  faviconLink: string,
  folderId: number,
  unreadCount: number,
  link: string
}

type Item = {
  id: number,
  url: string,
  title: string,
  author: string | null,
  pubDate: number,
  body: string,
  feedId: number,
  unread: boolean,
  starred: boolean,
  enclosureLink: string | null,
  lastModified: number,
}

type MappedItemFields = {
  feedFavicon: string,
  feedTitle: string,
  previewImageURL: string | undefined
}

type MappedItem = Item & MappedItemFields;

type FeedsState = {
  folders: Array<Folder>,
  feeds: Array<Feed>,
  items: Array<MappedItem>,
  syncing: boolean,
}

type Credentials = {
  username?: string,
  password?: string,
  url?: string,
}

type UserState = {
  credentials: Credentials,
}

const imageRegex = /<img[\s\S]*?src="(.*?)"[\s\S]*?>/;

const imageFromBody = (body: string) => {
  const match = body.match(imageRegex);
  if (!match || match.length < 1) {
    return undefined;
  }
  return match[1];
};

function mapItems(items: Array<Item>, feeds: Array<Feed>): Array<MappedItem> {
  const feedsMap = Object.fromEntries(feeds.map((feed) => [feed.id, feed]));
  return items.map((item) => ({
    ...item,
    feedFavicon: feedsMap[`${item.feedId}`]?.faviconLink,
    feedTitle: feedsMap[`${item.feedId}`]?.title,
    previewImageURL: item.enclosureLink || imageFromBody(item.body),
  }))
}

export const useFeedsStore = defineStore('feeds', {
  state: (): FeedsState => ({
    folders: [],
    feeds: [],
    items: [],
    syncing: false,
  }),
  actions: {
    setFeeds(feeds: Array<Feed>) {
      this.feeds = feeds
    },
    setFolders(folders: Array<Folder>) {
      this.folders = folders
    },
    setItems(items: Array<Item>, feeds: Array<Feed>) {
      this.items = mapItems(items, feeds)
    },
    setSyncing(syncing: boolean) {
      this.syncing = syncing
    }
  },
  getters: {
    getItemsForFolder: (state) => {
      return (folderId: string | string[]): Array<MappedItem> => {
        const id = parseInt(folderId as string, 10);
        const feedIds = state.feeds.filter(feed => feed.folderId == id).map(feed => feed.id);
        return state.items.filter((item) => feedIds.includes(item.feedId));
      }
    },
    getItemsForFeed: (state) => {
      return (feedId: string | string[]): Array<MappedItem> => {
        const id = parseInt(feedId as string, 10);
        return state.items.filter((item) => item.feedId === id);
      }
    },
    getUnreadItems: (state) => {
      return state.items.filter((item) => item.unread);
    },
    getStarredItems: (state) => {
      return state.items.filter((item) => item.starred);
    }
  },
})

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    credentials: {},
  }),
  actions: {
    setCredentials(credentials: Credentials) {
      this.credentials = credentials
    },
  },
})

export type { Item, MappedItem, Feed, Credentials, Folder }

export type FeedStore = ReturnType<typeof useFeedsStore>