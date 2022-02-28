import React from 'react';
import { View } from 'react-native';
import { useThemeStore } from '../../stores/theme';
import { eSendEvent, presentSheet } from '../../services/event-manager';
import { eCloseAnnouncementDialog } from '../../utils/events';
import { openLinkInBrowser } from '../../utils/functions';
import { SIZE } from '../../utils/size';
import { sleep } from '../../utils/time';
import SettingsBackupAndRestore from '../../screens/settings/backup-restore';
import { Button } from '../ui/button';
import SheetProvider from '../sheet-provider';
import { PricingPlans } from '../premium/pricing-plans';
import { allowedOnPlatform, getStyle } from './functions';

export const Cta = ({ actions, style = {}, color, inline }) => {
  const colors = useThemeStore(state => state.colors);
  let buttons = actions.filter(item => allowedOnPlatform(item.platforms)) || [];

  const onPress = async item => {
    if (!inline) {
      eSendEvent(eCloseAnnouncementDialog);
      await sleep(500);
    }
    if (item.type === 'link') {
      try {
        await openLinkInBrowser(item.data, colors);
      } catch (e) {}
    } else if (item.type === 'promo') {
      presentSheet({
        component: (
          <PricingPlans
            marginTop={1}
            promo={{
              promoCode: item.data,
              text: item.title
            }}
          />
        )
      });
    } else if (item.type === 'backup') {
      presentSheet({
        title: 'Backup & restore',
        paragraph: 'Please enable automatic backups to keep your data safe',
        component: <SettingsBackupAndRestore isSheet={true} />
      });
    }
  };
  return (
    <View
      style={{
        paddingHorizontal: 12,
        ...getStyle(style)
      }}
    >
      <SheetProvider context="premium_cta" />
      {buttons.length > 0 &&
        buttons.slice(0, 1).map(item => (
          <Button
            key={item.title}
            title={item.title}
            fontSize={SIZE.md}
            buttonType={{
              color: color ? color : colors.accent,
              text: colors.light,
              selected: color ? color : colors.accent,
              opacity: 1
            }}
            onPress={() => onPress(item)}
            width={'100%'}
            style={{
              marginBottom: 5
            }}
          />
        ))}

      {buttons.length > 1 &&
        buttons.slice(1, 2).map((item, index) => (
          <Button
            key={item.title}
            title={item.title}
            fontSize={SIZE.xs}
            type="gray"
            onPress={() => onPress(item)}
            width={null}
            height={20}
            style={{
              minWidth: '50%'
            }}
            textStyle={{
              textDecorationLine: 'underline'
            }}
          />
        ))}
    </View>
  );
};
