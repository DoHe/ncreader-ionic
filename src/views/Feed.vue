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
        <strong class="capitalize">{{ $route.params.name }} ({{ $route.params.id }})</strong>
        <ion-list>
          <ion-item-sliding v-for="item in getItemsForFolder($route.params.id)"
            @ionDrag="(ev: CustomEvent) => itemDragged(ev, 1)">
            <ion-item-options side="start">
              <ion-item-option color="success">Browser</ion-item-option>
            </ion-item-options>

            <ion-item>
              <ion-label>
                {{ item.title }}
              </ion-label>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option color="success">Star</ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { useFeedsStore } from '../store'

const store = useFeedsStore()
const { getItemsForFolder } = storeToRefs(store)

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
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}
</style>
