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

type State = {
  folders: Array<Folder>,
  feeds: Array<Feed>,
  items: Array<Item>,
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
    setItems(items: Array<Item>) {
      this.items = items
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