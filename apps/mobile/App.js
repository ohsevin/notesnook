import React, { useEffect } from 'react';
import Orientation from 'react-native-orientation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Launcher from './src/components/launcher';
import { ApplicationHolder } from './src/navigation';
import { useThemeStore } from './src/stores/theme';
import { initialize, useSettingStore, useUserStore } from './src/stores/stores';
import { DDS } from './src/services/device-detection';
import { eSendEvent } from './src/services/event-manager';
import Notifications from './src/services/notifications';
import SettingsService from './src/services/settings';
import { TipManager } from './src/services/tip-manager';
import { db } from './src/utils/database';
import { MMKV } from './src/utils/database/mmkv';
import { useAppEvents } from './src/utils/hooks/use-app-events';

let databaseHasLoaded = false;

const loadDatabase = async () => {
  let requireIntro = await MMKV.getItem('introCompleted');
  useSettingStore.getState().setIntroCompleted(requireIntro ? true : false);
  await db.init();
  Notifications.get();
  await checkFirstLaunch();
};

async function checkFirstLaunch() {
  let requireIntro = useSettingStore.getState().isIntroCompleted;
  if (!requireIntro) {
    await MMKV.setItem(
      'askForRating',
      JSON.stringify({
        timestamp: Date.now() + 86400000 * 2
      })
    );
    await MMKV.setItem(
      'askForBackup',
      JSON.stringify({
        timestamp: Date.now() + 86400000 * 3
      })
    );
  }
}

function checkOrientation() {
  Orientation.getOrientation((e, r) => {
    DDS.checkSmallTab(r);
    useSettingStore.getState().setDimensions({ width: DDS.width, height: DDS.height });
    useSettingStore
      .getState()
      .setDeviceMode(DDS.isLargeTablet() ? 'tablet' : DDS.isSmallTab ? 'smallTablet' : 'mobile');
  });
}

const loadMainApp = () => {
  if (databaseHasLoaded) {
    eSendEvent('load_overlay');
    initialize();
  }
};
checkOrientation();
const App = () => {
  const setVerifyUser = useUserStore(state => state.setVerifyUser);
  const appEvents = useAppEvents();

  useEffect(() => {
    databaseHasLoaded = false;
    (async () => {
      try {
        await SettingsService.init();
        if (SettingsService.get().appLockMode && SettingsService.get().appLockMode !== 'none') {
          setVerifyUser(true);
        }
        await TipManager.init();
        await loadDatabase();
        useUserStore.getState().setUser(await db.user.getUser());
      } catch (e) {
      } finally {
        databaseHasLoaded = true;
        loadMainApp();
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <ApplicationHolder />
      <Launcher onLoad={loadMainApp} />
    </SafeAreaProvider>
  );
};

export default App;
