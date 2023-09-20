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
          <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
            <ion-item @click="selectedIndex = i" router-direction="root" :router-link="p.url" lines="none" :detail="false"
              class="hydrated" :class="{ selected: selectedIndex === i }">
              <ion-icon aria-hidden="true" slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
              <ion-label>{{ p.title }}</ion-label>
            </ion-item>
          </ion-menu-toggle>
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
  IonMenuToggle,
  IonRouterOutlet,
} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import {
  mailOutline,
  mailSharp,
} from 'ionicons/icons';

import * as feeds from './mocks/feeds.json';
import * as folders from './mocks/folders.json';
import * as items from './mocks/items.json';
import { useFeedsStore } from './store'

const menu = ref();
const selectedIndex = ref(0);

onMounted(() => { menu.value.$el.open(false) })


const store = useFeedsStore()

store.setFeeds(feeds.feeds);
store.setFolders(folders.folders);
// @ts-ignore
store.setItems(items.items);

const appPages = folders.folders.map(folder => ({
  title: folder.name,
  url: `/feed/folder/${folder.name}/${folder.id}`,
  iosIcon: mailOutline,
  mdIcon: mailSharp,
}))

const { pathname } = window.location
if (pathname !== undefined) {
  selectedIndex.value = appPages.findIndex((page) => page.url === pathname);
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
</style>
