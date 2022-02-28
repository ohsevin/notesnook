import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { notesnook } from '../../../../e2e/test.ids';
import { useThemeStore } from '../../../stores/theme';
import { useSettingStore } from '../../../stores/stores';
import { eSendEvent } from '../../../services/event-manager';
import Navigation from '../../../services/navigation';
import { getTotalNotes, history } from '../../../utils';
import { refreshNotesPage } from '../../../utils/events';
import { SIZE } from '../../../utils/size';
import { IconButton } from '../../ui/icon-button';
import { Button } from '../../ui/button';
import { Properties } from '../../properties';
import Heading from '../../ui/typography/heading';
import Paragraph from '../../ui/typography/paragraph';

export const NotebookItem = ({ item, isTopic = false, notebookID, isTrash, dateBy }) => {
  const colors = useThemeStore(state => state.colors);
  const settings = useSettingStore(state => state.settings);
  const compactMode = settings.notebooksListMode === 'compact';
  const topics = item.topics?.slice(0, 3) || [];
  const totalNotes = getTotalNotes(item);
  const showActionSheet = () => {
    Properties.present(item);
  };

  const navigateToTopic = topic => {
    if (history.selectedItemsList.length > 0) return;
    let routeName = 'NotesPage';
    let params = { ...topic, menu: false, get: 'topics' };
    let headerState = {
      heading: topic.title,
      id: topic.id,
      type: topic.type
    };
    eSendEvent(refreshNotesPage, params);
    Navigation.navigate(routeName, params, headerState);
  };

  return (
    <>
      <View
        style={{
          flexGrow: 1,
          flexShrink: 1
        }}
      >
        <Heading
          size={SIZE.md}
          numberOfLines={1}
          style={{
            flexWrap: 'wrap'
          }}
        >
          {item.title}
        </Heading>
        {isTopic || !item.description || compactMode ? null : (
          <Paragraph
            size={SIZE.sm}
            numberOfLines={2}
            style={{
              flexWrap: 'wrap'
            }}
          >
            {item.description}
          </Paragraph>
        )}

        {isTopic || compactMode ? null : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            {topics.map(topic => (
              <Button
                title={topic.title}
                key={topic.id}
                height={null}
                textStyle={{
                  fontWeight: 'normal',
                  fontFamily: null,
                  marginRight: 0
                }}
                type="grayBg"
                fontSize={SIZE.xs}
                icon="bookmark-outline"
                iconSize={SIZE.sm}
                style={{
                  borderRadius: 5,
                  maxWidth: 120,
                  borderWidth: 0.5,
                  paddingVertical: 2.5,
                  borderColor: colors.icon,
                  paddingHorizontal: 6,
                  marginVertical: 5,
                  marginRight: 5
                }}
                onPress={() => navigateToTopic(topic)}
              />
            ))}
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginTop: 5,
            height: SIZE.md + 2
          }}
        >
          <Paragraph
            color={colors.accent}
            size={SIZE.xs}
            style={{
              marginRight: 6
            }}
          >
            {isTopic ? 'Topic' : 'Notebook'}
          </Paragraph>

          {isTrash ? (
            <>
              <Paragraph
                color={colors.icon}
                size={SIZE.xs}
                style={{
                  textAlignVertical: 'center',
                  marginRight: 6
                }}
              >
                {'Deleted on ' + new Date(item.dateDeleted).toISOString().slice(0, 10)}
              </Paragraph>
              <Paragraph
                color={colors.accent}
                size={SIZE.xs}
                style={{
                  textAlignVertical: 'center',
                  marginRight: 6
                }}
              >
                {item.itemType[0].toUpperCase() + item.itemType.slice(1)}
              </Paragraph>
            </>
          ) : (
            <Paragraph
              color={colors.icon}
              size={SIZE.xs}
              style={{
                marginRight: 6
              }}
            >
              {new Date(item[dateBy]).toDateString().substring(4)}
            </Paragraph>
          )}
          <Paragraph
            color={colors.icon}
            size={SIZE.xs}
            style={{
              marginRight: 6
            }}
          >
            {item && totalNotes > 1
              ? totalNotes + ' notes'
              : totalNotes === 1
              ? totalNotes + ' note'
              : '0 notes'}
          </Paragraph>

          {item.pinned ? (
            <Icon
              name="pin-outline"
              size={SIZE.sm}
              style={{
                marginRight: 10,
                marginTop: 2
              }}
              color={colors.accent}
            />
          ) : null}
        </View>
      </View>
      <IconButton
        color={colors.heading}
        name="dots-horizontal"
        testID={notesnook.ids.notebook.menu}
        size={SIZE.xl}
        onPress={showActionSheet}
        customStyle={{
          justifyContent: 'center',
          height: 35,
          width: 35,
          borderRadius: 100,
          alignItems: 'center'
        }}
      />
    </>
  );
};
