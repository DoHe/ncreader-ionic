<template>
  <ion-item-sliding @ionDrag="(ev: CustomEvent) => itemDragged(ev, 1)">
    <ion-item-options side="start">
      <ion-item-option color="success">Browser</ion-item-option>
    </ion-item-options>

    <ion-item>
      <div class="horizontal-container">
        <div class="top">
          <div class="left-side">
            <span>
              {{ item.title }}
            </span>

            <span>
              {{ body }}
            </span>
          </div>
          <div class="right-side">
            <ion-img v-if="item.enclosureLink" class="image" :src="item.enclosureLink" />
            <div v-else class="image"></div>
          </div>
        </div>
        <div class="bottom">
          {{ item.pubDate }} {{ item.starred }}
        </div>
      </div>
    </ion-item>

    <ion-item-options side="end">
      <ion-item-option color="success">Star</ion-item-option>
    </ion-item-options>
  </ion-item-sliding>
</template>

<script setup lang="ts">
import {
  IonImg,
  IonItem,
  IonLabel,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from '@ionic/vue';
import { useFeedsStore, Item } from '../store';

const props = defineProps<{
  item: Item
}>()
const htmlTagsRegex = /(<([^>]+)>)/ig;
const item = props.item;
const body = item.body.replace(htmlTagsRegex, '').trim()

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
.horizontal-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.top {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

.left-side {
  display: flex;
  flex-shrink: 10;
  flex-direction: column;
}

.bottom {
  display: 'flex';
  font-style: 'italic';
  align-items: 'center';
  margin-top: 'auto';
  flex-wrap: 'nowrap';
  flex-direction: 'row';
  width: 100%;
}

.image {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.image::part(image) {
  border-radius: 20px;
}
</style>