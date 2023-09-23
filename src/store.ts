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
  author: string,
  pubDate: number,
  body: string,
  feedId: number,
  unread: boolean,
  starred: boolean,
  enclosureLink: string,
}

type MappedItemFields = {
  feedFavicon: string,
  feedTitle: string,
  previewImageURL: string | undefined
}

type MappedItem = Item & MappedItemFields;

type State = {
  folders: Array<Folder>,
  feeds: Array<Feed>,
  items: Array<Item>,
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
  state: (): State => ({
    folders: [],
    feeds: [],
    items: [],
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
  },
  getters: {
    getItemsForFolder: (state) => {
      return (folderId: string | string[]): Array<Item> => {
        const id = parseInt(folderId as string, 10);
        const feedIds = state.feeds.filter(feed => feed.folderId == id).map(feed => feed.id);
        return state.items.filter((item) => feedIds.includes(item.feedId));
      }
    },
  },
})

export type { Item, MappedItem }