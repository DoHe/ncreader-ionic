import { Storage } from '@ionic/storage';

import { credentialsKey } from '@/constants';
import { useUserStore, Credentials } from '@/store';

async function getCredentials() {
  const store = useUserStore();

  const storage = new Storage();
  await storage.create();

  const storedValue = await storage.get(credentialsKey);
  if (!storedValue) {
    return;
  }

  const storedCredentials: Credentials = JSON.parse(storedValue);
  if (!(
    storedCredentials.username
    && storedCredentials.password
    && storedCredentials.url
  )) {
    return;
  }

  store.setCredentials(storedCredentials);
}

export default getCredentials;
