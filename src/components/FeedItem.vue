<template>
  <ion-item-sliding @ionDrag="(ev: CustomEvent) => itemDragged(ev, 1)">
    <ion-item-options side="start">
      <ion-item-option color="none">
        <ion-icon slot="icon-only" :ios="earthOutline" :md="earth" aria-label="Browser" color="primary"></ion-icon>
      </ion-item-option>
    </ion-item-options>

    <ion-item>
      <div class="vertical-container">
        <div class="top">
          <div class="left-side">
            <span :class="{
              'title-web': !isPlatform('android'),
              'title-mob': isPlatform('android'),
            }">
              {{ item.title }}
            </span>

            <span :class="{
              'body-web': !isPlatform('android'),
              'body-mob': isPlatform('android'),
            }">
              {{ body }}
            </span>
          </div>
          <div class="right-side">
            <ion-img v-if="item.previewImageURL" class="image" :src="item.previewImageURL" />
            <div v-else class="image"></div>
          </div>
        </div>
        <div class="bottom">
          <ion-img v-if="item.feedFavicon" class="favicon" :src="item.feedFavicon" />
          <ion-label class="footer" color="medium">
            {{ item.feedTitle }} · {{ moment(item.pubDate * 1000).fromNow(true) }}
          </ion-label>
          <ion-icon :ios="starOutline" :md="star" aria-label="Starred" v-if="item.starred" class="star"
            color="warning"></ion-icon>
        </div>
      </div>
    </ion-item>

    <ion-item-options side="end">
      <ion-item-option color="none">
        <ion-icon slot="icon-only" :ios="starOutline" :md="star" aria-label="Star" color="warning"></ion-icon>
      </ion-item-option>
    </ion-item-options>
  </ion-item-sliding>
</template>

<script setup lang="ts">
import {
  isPlatform,
  IonImg,
  IonIcon,
  IonItem,
  IonLabel,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from '@ionic/vue';
import {
  earth,
  earthOutline,
  star,
  starOutline,
} from 'ionicons/icons';
import moment from 'moment';
import { MappedItem } from '../store';

const props = defineProps<{
  item: MappedItem
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
.vertical-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
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
  gap: 10px;
}

.bottom {
  display: flex;
  font-style: italic;
  align-items: center;
  margin-top: auto;
  flex-wrap: nowrap;
  flex-direction: row;
  width: 100%;
  gap: 5px;
}

.star {
  margin-left: auto;
}

.image {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.image::part(image) {
  border-radius: 20px;
}

.favicon {
  width: 16px;
  height: 16px;
}

.footer {
  font-size: small;
}

.title-web {
  font-weight: bold;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

.title-mob {
  font-weight: bold;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.body-web {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.body-mob {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>