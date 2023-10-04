<template>
  <ion-app>
    <ion-menu ref="menu" content-id="main-content" type="overlay">
      <ion-content>
        <ion-list id="feeds-list">
          <ion-list-header>
            <ion-label class="list-header">
              <h1>Feeds</h1>
              <ion-icon @click="syncClicked" size="large" :ios="syncOutline" :md="syncIcon" ref="syncIconElement"
                :disabled="syncing"></ion-icon>
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
  createAnimation,
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
import type { Animation } from '@ionic/vue';
import { watch, ref, onMounted, computed, ComputedRef } from 'vue';
import { useRouter } from 'vue-router';
import {
  folderOutline,
  folder,
  eyeOutline,
  eye,
  starOutline,
  star,
  sync as syncIcon,
  syncOutline,
} from 'ionicons/icons';

import { useFeedsStore, Feed, useUserStore } from './store';
import sync from './data/sync';
import { storeToRefs } from 'pinia';
import getCredentials from './data/credentials';

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
const feedsStore = useFeedsStore();
const userStore = useUserStore();

const menu = ref();
const syncIconElement = ref();

const { pathname } = window.location;
const selectedPath = ref(pathname);

let animation: Animation;
const { syncing } = storeToRefs(feedsStore)
const { credentials } = storeToRefs(userStore)

watch(syncing, () => {
  if (syncing.value) {
    animation.play();
  } else {
    animation.stop();
  }
})

watch(credentials, () => {
  if (credentials.value.password &&
    credentials.value.username &&
    credentials.value.url) {
    sync({ mocked: false, startup: true });
    menu.value.$el.open(false);
  }
})

onMounted(async () => {
  animation = createAnimation()
    .addElement(syncIconElement.value.$el)
    .duration(1000)
    .iterations(Infinity)
    .fromTo('transform', 'rotate(0deg)', 'rotate(360deg)');

  await getCredentials();
  if (!(credentials.value.password &&
    credentials.value.username &&
    credentials.value.url)) {
    router.replace('/login');
  }
})

useBackButton(1000, () => {
  menu.value.$el.toggle();
});

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
const folderPages: ComputedRef<Array<FolderPage>> = computed(() => feedsStore.folders.map(folderData => {
  const items = feedsStore.items;
  const feedsForFolder = feedsStore.feeds.filter(feed => {
    if (feed.folderId !== folderData.id) {
      return false;
    }
    let hasUnread = false;
    for (const item of items) {
      if (item.unread && item.feedId === feed.id) {
        hasUnread = true;
        break;
      }
    }
    return hasUnread;
  });
  return {
    title: folderData.name,
    url: `/feed/folder/${folderData.name}/${folderData.id}`,
    iosIcon: folderOutline,
    mdIcon: folder,
    feeds: feedsForFolder,
  }
}).filter(folderPage => folderPage.feeds.length > 0))

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

function syncClicked() {
  if (!syncing.value) {
    sync({ mocked: false, startup: false })
  }
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

.list-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-right: 10px;
}
</style>
