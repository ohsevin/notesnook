import React, {useEffect, useState} from 'react';
import {Keyboard, Text, TouchableOpacity, View} from 'react-native';
import Animated, {Easing, useValue} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTracked} from '../../provider';
import {DDS} from '../../services/DeviceDetection';
import {eSubscribeEvent, eUnSubscribeEvent} from '../../services/EventManager';
import {dHeight, getElevation} from '../../utils';
import {eHideToast, eShowToast} from '../../utils/Events';
import {sleep} from '../../utils/TimeUtils';
import Paragraph from '../Typography/Paragraph';
const {timing} = Animated;

let toastMessages = [];
export const Toast = ({context = 'global'}) => {
  const [state, dispatch] = useTracked();
  const colors = state.colors;
  const [keyboard, setKeyboard] = useState(false);
  const [data, setData] = useState({});
  const [toastStyle, setToastStyle] = useState({
    backgroundColor: colors.errorBg,
    color: colors.errorText,
  });

  let toastTranslate = useValue(dHeight);
  let toastOpacity = useValue(1);

  const showToastFunc = async (data) => {
    if (data.context !== context) return;
    if (toastMessages.findIndex((m) => m.message === data.message) >= 0) {
      return;
    }
    toastMessages.push(data);
    if (toastMessages?.length > 1) return;

    setData(data);
    if (data.type === 'success') {
      setToastStyle({
        color: colors.successText,
      });
    } else {
      setToastStyle({
        color: colors.errorText,
      });
    }
    toastTranslate.setValue(dHeight);
    toastTranslate.setValue(0);
    await sleep(50);
    timing(toastOpacity, {
      toValue: 1,
      duration: 150,
      easing: Easing.ease,
    }).start();

    setTimeout(() => {
      hideToastFunc();
    }, data.duration);
  };

  const showNext = (data) => {
    setData(data);
    if (data.type === 'success') {
      setToastStyle({
        color: colors.successText,
      });
    } else {
      setToastStyle({
        color: colors.errorText,
      });
    }
    setTimeout(() => {
      hideToastFunc();
    }, toastMessages[0].duration);
  };

  const hideToastFunc = (data) => {
    if (toastMessages.length > 1) {
      toastMessages.shift();

      timing(toastOpacity, {
        toValue: 0,
        duration: 100,
        easing: Easing.in(Easing.ease),
      }).start(() => {
        showNext(toastMessages[0]);
        setTimeout(() => {
          timing(toastOpacity, {
            toValue: 1,
            duration: 150,
            easing: Easing.in(Easing.ease),
          }).start();
        }, 300);
      });
    } else {
      timing(toastOpacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
      }).start(async () => {
        await sleep(100);
        toastTranslate.setValue(dHeight);
        toastMessages.shift();
        setData({});
      });
    }
  };

  const _onKeyboardShow = () => {
    setKeyboard(true);
  };

  const _onKeyboardHide = () => {
    setKeyboard(false);
  };

  useEffect(() => {
    toastMessages = [];
    toastTranslate.setValue(dHeight);
    toastOpacity.setValue(0);
    Keyboard.addListener('keyboardDidShow', _onKeyboardShow);
    Keyboard.addListener('keyboardDidHide', _onKeyboardHide);
    eSubscribeEvent(eShowToast, showToastFunc);
    eSubscribeEvent(eHideToast, hideToastFunc);
    return () => {
      toastMessages = [];
      Keyboard.removeListener('keyboardDidShow', _onKeyboardShow);
      Keyboard.removeListener('keyboardDidHide', _onKeyboardHide);
      eUnSubscribeEvent(eShowToast, showToastFunc);
      eUnSubscribeEvent(eHideToast, hideToastFunc);
    };
  }, [keyboard]);

  return (
    <Animated.View
      style={{
        width: DDS.isTab ? 300 : '100%',
        alignItems: 'center',
        alignSelf: 'center',
        minHeight: 30,
        bottom: keyboard ? 30 : 100,
        position: 'absolute',
        zIndex: 999,
        elevation: 15,
        opacity: toastOpacity,
        transform: [
          {
            translateY: toastTranslate,
          },
        ],
      }}>
      <Animated.View
        activeOpacity={0.8}
        style={{
          ...getElevation(5),
          ...toastStyle,
          maxWidth: '95%',
          backgroundColor: 'black',
          minWidth: data.func ? '95%' : '50%',
          alignSelf: 'center',
          borderRadius: 5,
          minHeight: 30,
          paddingVertical: 10,
          paddingHorizontal: 15,
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            maxWidth: !data.func ? '90%' : '75%',
          }}>
          <View
            style={{
              width: 25,
              height: 25,
              backgroundColor:
                data.type === 'error' ? colors.errorText : colors.successText,
              borderRadius: 100,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 10,
            }}>
            <Icon
              name={data.type === 'success' ? 'check' : 'close'}
              size={20}
              color="white"
            />
          </View>

          <Paragraph
            color="white"
            onPress={() => {
              hideToastFunc();
            }}
            style={{
              width: '90%',
            }}>
            {data.message}
          </Paragraph>
        </View>

        {data.func ? (
          <TouchableOpacity
            onPress={data.func}
            style={{
              width: '15%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 5,
            }}
            activeOpacity={0.5}>
            <Paragraph
              color={
                data.type === 'error' ? colors.errorText : colors.successText
              }>
              {data.actionText}
            </Paragraph>
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
};
