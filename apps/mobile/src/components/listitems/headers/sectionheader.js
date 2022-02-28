import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useThemeStore } from '../../../stores/theme';
import { useSettingStore } from '../../../stores/stores';
import {
  eSendEvent,
  eSubscribeEvent,
  eUnSubscribeEvent,
  presentSheet
} from '../../../services/event-manager';
import SettingsService from '../../../services/settings';
import { GROUP } from '../../../utils/constants';
import { COLORS_NOTE } from '../../../utils/color-scheme';
import { db } from '../../../utils/database';
import { eOpenJumpToDialog } from '../../../utils/events';
import { SIZE } from '../../../utils/size';
import { IconButton } from '../../ui/icon-button';
import { Button } from '../../ui/button';
import Sort from '../../sheets/sort';
import Heading from '../../ui/typography/heading';

export const SectionHeader = ({ item, index, type, color, screen }) => {
  const colors = useThemeStore(state => state.colors);
  const { fontScale } = useWindowDimensions();
  const [groupOptions, setGroupOptions] = useState(db.settings?.getGroupOptions(type));
  let groupBy = Object.keys(GROUP).find(key => GROUP[key] === groupOptions.groupBy);
  const jumpToRef = useRef();
  const sortRef = useRef();
  const compactModeRef = useRef();

  const settings = useSettingStore(state => state.settings);
  const listMode = type === 'notebooks' ? settings.notebooksListMode : settings.notesListMode;

  groupBy = !groupBy
    ? 'Default'
    : groupBy.slice(0, 1).toUpperCase() + groupBy.slice(1, groupBy.length);

  const onUpdate = () => {
    setGroupOptions({ ...db.settings?.getGroupOptions(type) });
  };

  useEffect(() => {
    eSubscribeEvent('groupOptionsUpdate', onUpdate);
    return () => {
      eUnSubscribeEvent('groupOptionsUpdate', onUpdate);
    };
  }, []);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '95%',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        height: 35 * fontScale,
        backgroundColor: colors.nav,
        alignSelf: 'center',
        borderRadius: 5,
        marginVertical: 5
      }}
    >
      <TouchableOpacity
        onPress={() => {
          eSendEvent(eOpenJumpToDialog, type);
        }}
        ref={jumpToRef}
        activeOpacity={0.9}
        hitSlop={{ top: 10, left: 10, right: 30, bottom: 15 }}
        style={{
          height: '100%',
          justifyContent: 'center'
        }}
      >
        <Heading
          color={COLORS_NOTE[color?.toLowerCase()] || colors.accent}
          size={SIZE.sm}
          style={{
            minWidth: 60,
            alignSelf: 'center',
            textAlignVertical: 'center'
          }}
        >
          {!item.title || item.title === '' ? 'Pinned' : item.title}
        </Heading>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        {index === 0 ? (
          <>
            <Button
              onPress={() => {
                presentSheet({
                  component: <Sort screen={screen} type={type} />
                });
              }}
              tooltipText="Change sorting of items in list"
              fwdRef={sortRef}
              title={groupBy}
              icon={groupOptions.sortDirection === 'asc' ? 'sort-ascending' : 'sort-descending'}
              height={25}
              style={{
                borderRadius: 100,
                paddingHorizontal: 0,
                backgroundColor: 'transparent',
                marginRight: type === 'notes' || type === 'home' || type === 'notebooks' ? 10 : 0
              }}
              type="gray"
              iconPosition="right"
            />

            {type === 'notes' || type === 'notebooks' || type === 'home' ? (
              <IconButton
                customStyle={{
                  width: 25,
                  height: 25
                }}
                tooltipText={
                  listMode == 'compact' ? 'Switch to normal mode' : 'Switch to compact mode'
                }
                fwdRef={compactModeRef}
                color={colors.icon}
                name={listMode == 'compact' ? 'view-list' : 'view-list-outline'}
                onPress={() => {
                  SettingsService.set(
                    type !== 'notebooks' ? 'notesListMode' : 'notebooksListMode',
                    listMode === 'normal' ? 'compact' : 'normal'
                  );
                }}
                size={SIZE.lg - 2}
              />
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
};
