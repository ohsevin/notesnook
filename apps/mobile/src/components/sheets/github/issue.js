import Clipboard from '@react-native-clipboard/clipboard';
import React, { useRef, useState } from 'react';
import { Linking, Platform, Text, TextInput, View } from 'react-native';
import { useThemeStore } from '../../../stores/theme';
import { useUserStore } from '../../../stores/stores';
import { eSendEvent, ToastEvent } from '../../../services/event-manager';
import PremiumService from '../../../services/premium';
import { APP_VERSION } from '../../../../version';
import { db } from '../../../utils/database';
import { eCloseProgressDialog } from '../../../utils/events';
import { openLinkInBrowser } from '../../../utils/functions';
import { SIZE } from '../../../utils/size';
import { sleep } from '../../../utils/time';
import { Button } from '../../ui/button';
import DialogHeader from '../../dialog/dialog-header';
import { presentDialog } from '../../dialog/functions';
import Seperator from '../../ui/seperator';
import Paragraph from '../../ui/typography/paragraph';
import deviceInfoModule from 'react-native-device-info';

export const Issue = () => {
  const colors = useThemeStore(state => state.colors);
  const body = useRef(null);
  const title = useRef(null);
  const user = useUserStore(state => state.user);
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    if (loading) return;
    if (!title.current || !body.current) return;
    if (title.current?.trim() === '' || body.current?.trim().length === 0) return;

    try {
      setLoading(true);

      let issue_url = await db.debug.report({
        title: title.current,
        body:
          body.current +
          `\n_______________
**Device information:**
App version: ${APP_VERSION}
Platform: ${Platform.OS}
Model: ${Platform.constants.Brand || ''}-${Platform.constants.Model || ''}-${
            Platform.constants.Version || ''
          }
Pro: ${PremiumService.get()}
Logged in: ${user ? 'yes' : 'no'}`,
        userId: user?.id
      });
      setLoading(false);
      eSendEvent(eCloseProgressDialog);
      await sleep(300);
      presentDialog({
        title: 'Issue reported',
        paragraph: (
          <Text>
            You can track your issue at{' '}
            <Text
              style={{
                textDecorationLine: 'underline',
                color: colors.accent
              }}
              onPress={() => {
                Linking.openURL(issue_url);
              }}
            >
              {issue_url}.
            </Text>{' '}
            Please note that we will respond to your issue on the given link. We recommend that you
            save it.
          </Text>
        ),
        positiveText: 'Copy link',
        positivePress: () => {
          Clipboard.setString(issue_url);
          ToastEvent.show({
            heading: 'Issue url copied!',
            type: 'success',
            context: 'global'
          });
        },
        negativeText: 'Close'
      });
    } catch (e) {
      setLoading(false);
      ToastEvent.show({
        heading: 'An error occured',
        message: e.message,
        type: 'error'
      });
    }
  };

  return (
    <View
      style={{
        paddingHorizontal: 12
      }}
    >
      <DialogHeader
        title="Report issue"
        paragraph="Let us know if you have faced any issue/bug while using Notesnook."
      />

      <Seperator half />

      <TextInput
        placeholder="Title"
        onChangeText={v => (title.current = v)}
        style={{
          borderWidth: 1,
          borderColor: colors.nav,
          borderRadius: 5,
          padding: 12,
          fontFamily: 'OpenSans-Regular',
          marginBottom: 10,
          fontSize: SIZE.md,
          color: colors.heading
        }}
        placeholderTextColor={colors.placeholder}
      />

      <TextInput
        placeholder={`Tell us more about the issue you are facing.
        
For example:
- Steps to reproduce the issue
- Things you have tried etc.`}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        onChangeText={v => (body.current = v)}
        style={{
          borderWidth: 1,
          borderColor: colors.nav,
          borderRadius: 5,
          padding: 12,
          fontFamily: 'OpenSans-Regular',
          maxHeight: 200,
          fontSize: SIZE.sm,
          marginBottom: 2.5,
          color: colors.pri
        }}
        placeholderTextColor={colors.placeholder}
      />
      <Paragraph
        size={SIZE.xs}
        color={colors.icon}
      >{`App version: ${APP_VERSION} Platform: ${Platform.OS} Model: ${Platform.constants.Brand}-${Platform.constants.Model}-${Platform.constants.Version}`}</Paragraph>

      <Seperator />
      <Button
        onPress={onPress}
        title={loading ? null : 'Submit'}
        loading={loading}
        height={50}
        width="100%"
        type="accent"
      />

      <Paragraph
        color={colors.icon}
        size={SIZE.xs}
        style={{
          marginTop: 10,
          textAlign: 'center'
        }}
      >
        The information above will be publically available at{' '}
        <Text
          onPress={() => {
            Linking.openURL('https://github.com/streetwriters/notesnook');
          }}
          style={{
            textDecorationLine: 'underline',
            color: colors.accent
          }}
        >
          github.com/streetwriters/notesnook.
        </Text>{' '}
        If you want to ask something in general or need some assistance, we would suggest that you{' '}
        <Text
          style={{
            textDecorationLine: 'underline',
            color: colors.accent
          }}
          onPress={async () => {
            try {
              await openLinkInBrowser('https://discord.gg/zQBK97EE22', colors);
            } catch (e) {}
          }}
        >
          join our community on Discord.
        </Text>
      </Paragraph>
    </View>
  );
};
