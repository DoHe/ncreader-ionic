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

    <ion-content :fullscreen="true" :scroll-events="true" @ionScroll="handleScroll" @ionScrollEnd="handleScrollEnd"
      @wheel="handleMouseWheel" ref="content">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ $route.params.name }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="container">
        <ion-list>
          <div id="item" v-for="(item, index) in items" ref="itemElements" :data-id="item.id">
            <FeedItem :key="index" :item="item" />
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
const content = ref();

let scrollDirection = 0;

watchEffect(() => {
  if (itemElements.value && itemElements.value.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry: any) => {
        if (!entry.isIntersecting && scrollDirection === 1) {
          markRead(parseInt(entry.target.dataset.id, 10))
        }
      });
    }, { root: document });

    for (const element of itemElements.value) {
      observer.observe(element);
    }

  }
})

function markRead(id: number) {
  console.log('mark read: ' + id)
  store.markRead(id)
}

function handleScrollToBottom() {
  console.log('mark all read')
  for (const item of items.value) {
    markRead(item.id);
  }
}

async function handleScroll(event: CustomEvent) {
  scrollDirection = Math.sign(event.detail.deltaY);
  if (scrollDirection === 1) {
    // @ts-ignore
    const scrollElement = await event.target.getScrollElement()

    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    if (scrollHeight - scrollElement.scrollTop < 10) {
      handleScrollToBottom()
    }
  }
}

function handleScrollEnd() {
  scrollDirection = 0;
}

async function handleMouseWheel(event: WheelEvent) {
  if (event.deltaY > 0) {
    // @ts-ignore
    const scrollElement = await content.value.$el.getScrollElement()
    if (scrollElement.scrollHeight <= scrollElement.clientHeight) {
      handleScrollToBottom()
    }
  }
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
