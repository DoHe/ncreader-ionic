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

      <div class="container">
        <ion-list ref="listElement">
          <div id="item" v-for="(item, index) in items" ref="itemElements">
            <FeedItem :key="index" :item="item" />
            <div class="spacer" v-if="index < items.length - 1"></div>
          </div>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRaw } from 'vue'
import type { Ref } from 'vue'
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
import { useFeedsStore } from '../store'
import { useRoute } from 'vue-router';
import FeedItem from '../components/FeedItem.vue';

const route = useRoute();
const store = useFeedsStore();

const items = computed(() => {
  if (route.params.type === 'folder') {
    return store.getItemsForFolder(route.params.id)
  } else if (route.params.type === 'feed') {
    return store.getItemsForFeed(route.params.id)
  } else if (route.params.type === 'special') {
    if (route.params.name === 'Starred') {
      return store.getStarredItems
    } else if (route.params.name === 'Unread') {
      return store.getUnreadItems
    }
  }
  return []
})

const itemElements = ref([]);
const listElement = ref();

onMounted(() => {
  console.log(listElement.value.$el)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry: any) => {
      if (entry.isIntersecting) {
        console.log("intersected")
      } else {
        console.log("did not")
      }
    });
  }, { root: listElement.value.$el });

  const itemsselec = listElement.value.$el.querySelectorAll("#item")
  console.log(itemsselec)

  for (const element of itemsselec) {
    console.log(element)
    observer.observe(element.$el);
  }
})

function handleScroll(ev: CustomEvent) {
  // console.log('scroll', JSON.stringify(ev.detail));
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
.container {}

.spacer {
  height: 15px;
}
</style>
