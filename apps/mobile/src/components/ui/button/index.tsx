import React from 'react';
import { ActivityIndicator, ColorValue, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useThemeStore } from '../../../stores/theme';
import { showTooltip, TOOLTIP_POSITIONS } from '../../../utils';
import { BUTTON_TYPES } from '../../../utils/constants';
import { SIZE } from '../../../utils/size';
import { PressableButton, PressableButtonProps } from '../pressable';
import Heading from '../typography/heading';
import Paragraph from '../typography/paragraph';

interface ButtonProps extends PressableButtonProps {
  height?: number;
  icon?: string;
  fontSize?: number;
  tooltipText?: string;
  textStyle?: TextStyle;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  title?: string | null;
  loading?: boolean;
  width?: string | number | null;
  buttonType?: {
    text?: ColorValue;
    selected?: ColorValue;
    color?: ColorValue;
    opacity?: number;
    alpha?: number;
  };
  bold?: boolean;
  iconColor?: ColorValue;
}
export const Button = ({
  height = 45,
  width = null,
  onPress,
  loading = false,
  title = null,
  icon,
  fontSize = SIZE.sm,
  type = 'transparent',
  iconSize = SIZE.md,
  style = {},
  accentColor = 'accent',
  accentText = 'light',
  onLongPress,
  tooltipText,
  textStyle,
  iconPosition = 'left',
  buttonType,
  bold,
  iconColor,
  fwdRef,
  ...restProps
}: ButtonProps) => {
  const colors = useThemeStore(state => state.colors);

  const textColor = buttonType?.text
    ? buttonType.text
    : //@ts-ignore
      colors[
        type === 'accent'
          ? BUTTON_TYPES[type](accentColor, accentText).text
          : BUTTON_TYPES[type].text
      ];
  const Component = bold ? Heading : Paragraph;

  return (
    <PressableButton
      {...restProps}
      fwdRef={fwdRef}
      onPress={onPress}
      onLongPress={event => {
        if (onLongPress) {
          onLongPress(event);
          return;
        }
        if (tooltipText) {
          showTooltip(event, tooltipText, TOOLTIP_POSITIONS.TOP);
        }
      }}
      disabled={loading}
      type={type}
      accentColor={accentColor}
      accentText={accentText}
      customColor={buttonType?.color}
      customSelectedColor={buttonType?.selected}
      customOpacity={buttonType?.opacity}
      customAlpha={buttonType?.alpha}
      customStyle={{
        height: height,
        width: width || null,
        paddingHorizontal: 12,
        borderRadius: 5,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        //@ts-ignore
        ...style
      }}
    >
      {loading ? <ActivityIndicator color={textColor} size={fontSize + 4} /> : null}
      {icon && !loading && iconPosition === 'left' ? (
        <Icon
          name={icon}
          style={{
            marginRight: 0
          }}
          color={iconColor || buttonType?.text || textColor}
          size={iconSize}
        />
      ) : null}

      {!title ? null : (
        <Component
          color={textColor}
          size={fontSize}
          numberOfLines={1}
          style={[
            {
              marginLeft: icon || (loading && iconPosition === 'left') ? 5 : 0,
              marginRight: icon || (loading && iconPosition === 'right') ? 5 : 0
            },
            textStyle
          ]}
        >
          {title}
        </Component>
      )}

      {icon && !loading && iconPosition === 'right' ? (
        <Icon
          name={icon}
          style={{
            marginLeft: 0
          }}
          color={iconColor || buttonType?.text || textColor}
          size={iconSize}
        />
      ) : null}
    </PressableButton>
  );
};
