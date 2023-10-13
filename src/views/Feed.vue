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

    <ion-content :fullscreen="true" :scroll-events="true" @ionScroll="handleScroll($event)" ref="content">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ $route.params.name }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="container">
        <ion-list>
          <div id="item" v-for="(item, index) in items" ref="itemElements" :data-title="item.title">
            <FeedItem :key="index" :item="item" />
            <div class="spacer" v-if="index < items.length - 1"></div>
          </div>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
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
    return store.getItemsForFolder(route.params.id).filter(item => item.unread)
  } else if (route.params.type === 'feed') {
    return store.getItemsForFeed(route.params.id).filter(item => item.unread)
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
const content = ref();

let scrollDirection = 0;

watchEffect(() => {
  if (itemElements.value && itemElements.value.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry: any) => {
        if (!entry.isIntersecting && scrollDirection === 1) {
          //console.log("mark read:")
          //console.log(entry.target.dataset.title)

        }
      });
    }, { root: document });

    for (const element of itemElements.value) {
      observer.observe(element);
    }

  }
})

let lastTimeout: ReturnType<typeof setTimeout>;

async function handleScroll(ev: CustomEvent) {
  scrollDirection = Math.sign(ev.detail.deltaY);
  if (lastTimeout) {
    clearTimeout(lastTimeout)
  }
  if (scrollDirection === 1) {
    // @ts-ignore
    const scrollElement = await ev.target.getScrollElement()

    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    if (scrollHeight - scrollElement.scrollTop < 10) {
      console.log(`Scrolled to bottom`);
    }
  }
  lastTimeout = setTimeout(() => scrollDirection = 0, 200)
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
