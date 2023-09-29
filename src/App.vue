<template>
  <ion-app>
    <ion-menu ref="menu" content-id="main-content" type="overlay">
      <ion-content>
        <ion-list id="feeds-list">
          <ion-list-header>
            <ion-label>
              <h1>Feeds</h1>
            </ion-label>
          </ion-list-header>

          <ion-item v-for="(page, i) in specialPages" :key="i" @click="(event) => headerClicked(event, page.url)"
            router-direction="root" lines="none" :detail="false" class="hydrated"
            :class="{ selected: selectedPath === page.url }">
            <ion-icon aria-hidden="true" slot="start" :ios="page.iosIcon" :md="page.mdIcon"></ion-icon>
            <ion-label>{{ page.title }}</ion-label>
          </ion-item>

          <ion-accordion-group v-for="(page, i) in folderPages" :key="i + 2">
            <ion-accordion value="first">
              <ion-item slot="header" @click="(event) => headerClicked(event, page.url)" router-direction="root"
                lines="none" :detail="false" class="hydrated" :class="{ selected: selectedPath === page.url }">
                <ion-icon aria-hidden="true" slot="start" :ios="page.iosIcon" :md="page.mdIcon"></ion-icon>
                <ion-label>{{ page.title }}</ion-label>
              </ion-item>
              <ion-list slot="content">
                <ion-item v-for="(feed, i) in page.feeds" :key="i" class="feed-item"
                  @click="(event) => headerClicked(event, feedPath(feed))"
                  :class="{ selected: selectedPath === feedPath(feed) }" lines="none" :detail="false">
                  <ion-img :src="feed.faviconLink" class="feed-icon" aria-hidden="true" slot="start"></ion-img>
                  <ion-label>{{ feed.title }}</ion-label>
                </ion-item>
              </ion-list>
            </ion-accordion>
          </ion-accordion-group>
        </ion-list>
      </ion-content>
    </ion-menu>
    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonImg,
  IonRouterOutlet,
  useBackButton,
} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  folderOutline,
  folder,
  eyeOutline,
  eye,
  starOutline,
  star
} from 'ionicons/icons';

import * as feeds from './mocks/feeds.json';
import * as folders from './mocks/folders.json';
import * as items from './mocks/items.json';
import { useFeedsStore, Feed } from './store'

type SpecialPage = {
  title: string,
  url: string,
  iosIcon: string,
  mdIcon: string,
}

type FolderPageFields = {
  feeds: Array<Feed>
}

type FolderPage = SpecialPage & FolderPageFields;

const router = useRouter();
const menu = ref();
const { pathname } = window.location
const selectedPath = ref(pathname);

onMounted(() => { menu.value.$el.open(false) })

useBackButton(1000, () => {
  menu.value.$el.toggle();
});

const store = useFeedsStore()

store.setFeeds(feeds.feeds);
store.setFolders(folders.folders);
store.setItems(items.items, feeds.feeds);

const specialPages: Array<SpecialPage> = [
  {
    title: 'Starred',
    url: `/feed/special/Starred/0`,
    iosIcon: starOutline,
    mdIcon: star,
  },
  {
    title: 'Unread',
    url: `/feed/special/Unread/0`,
    iosIcon: eyeOutline,
    mdIcon: eye,
  }
]
const folderPages: Array<FolderPage> = folders.folders.map(folderData => {
  const feedsForFolder = feeds.feeds.filter(feed => feed.folderId === folderData.id);
  return {
    title: folderData.name,
    url: `/feed/folder/${folderData.name}/${folderData.id}`,
    iosIcon: folderOutline,
    mdIcon: folder,
    feeds: feedsForFolder,
  }
})

function headerClicked(event: CustomEvent, path: string) {
  // @ts-ignore
  if (event.target.slot !== 'end') {
    selectedPath.value = path;
    router.replace(path);
    menu.value.$el.close();
    event.stopPropagation();
  }
}

function feedPath(feed: Feed) {
  return `/feed/feed/${feed.title}/${feed.id}`
}
</script>

<style scoped>
ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}

.feed-icon {
  width: 16px;
  height: 16px;
}

.feed-item {
  padding-left: 10px;
}
</style>
