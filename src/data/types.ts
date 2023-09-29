import { Feed, Folder, Item } from '@/store'

type ApiData = {
  folders: {
    folders: Array<Folder>,
  },
  feeds: {
    feeds: Array<Feed>,
  },
  items: {
    items: Array<Item>,
  },
}

export type { ApiData }