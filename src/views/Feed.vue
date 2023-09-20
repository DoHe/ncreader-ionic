<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ $route.params.name }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" :scroll-events="true" @ionScroll="handleScroll($event)">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ $route.params.name }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <ion-list>
          <FeedItem :item="item" v-for="item in items" />
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
} from '@ionic/vue';
import { useFeedsStore, Item } from '../store'
import { useRoute } from 'vue-router';
import FeedItem from '../components/FeedItem.vue';

const route = useRoute();
const store = useFeedsStore();

const items = computed(() => {
  let items: Array<Item> = []
  if (route.params.type === 'folder') {
    items = store.getItemsForFolder(route.params.id)
  }
  return items
})

function handleScroll(ev: CustomEvent) {
  console.log('scroll', JSON.stringify(ev.detail));
}

function itemDragged(event: CustomEvent, id: Number) {
  if (Math.abs(event.detail.ratio) > 0.9) {
    setTimeout(() => {
      // @ts-ignore
      event.target.close();
      if (event.detail.ratio < 0) {
        console.log("Browser " + id);
      } else {
        console.log("Star " + id);
      }
    }, 200)
  }
}

</script>

<style scoped>
#container {}
</style>
