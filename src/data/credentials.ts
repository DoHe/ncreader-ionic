import { Storage } from '@ionic/storage';

import { credentialsKey } from '@/constants';
import { useUserStore, Credentials } from '@/store';

async function getCredentials() {
  const store = useUserStore();

  const storage = new Storage();
  await storage.create();

  const storedValued = await storage.get(credentialsKey);
  if (!storedValued) {
    return;
  }

  const storedCredentials: Credentials = JSON.parse(storedValued);
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
