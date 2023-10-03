<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Login</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="container">
        <div class="form">
          <ion-list class="inputs">
            <ion-item>
              <ion-input label="Username" placeholder="best username" label-placement="stacked"
                v-model="username"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Password" placeholder="super secret password" type="password" label-placement="stacked"
                v-model="password"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Nextcloud URL" placeholder="https://next.cloud/" type="url" label-placement="stacked"
                v-model="url"></ion-input>
            </ion-item>
          </ion-list>
          <ion-button @click="onSubmit">Login</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonContent,
  IonHeader,
  IonList,
  IonItem,
  IonInput,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { ref } from 'vue'
import { useUserStore } from '../store'
import { useRouter } from 'vue-router';
import { credentialsKey } from '@/constants';
import { Storage } from '@ionic/storage';

const username = ref('');
const password = ref('');
const url = ref('');

const store = useUserStore();
const router = useRouter();

async function onSubmit() {
  const storage = new Storage();
  await storage.create();

  const credentials = {
    username: username.value,
    password: password.value,
    url: url.value
  };

  storage.set(credentialsKey, JSON.stringify(credentials));
  store.setCredentials(credentials);
  router.replace('/feed/special/Unread/0');
}
</script>

<style scoped>
.container {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.form {
  width: 50%;
}

.inputs {
  margin-bottom: 10px;
}
</style>
