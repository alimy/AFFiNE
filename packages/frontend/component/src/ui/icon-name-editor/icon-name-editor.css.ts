import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { globalStyle, style } from '@vanilla-extract/css';

export const menuContent = style({
  padding: 4,
  borderRadius: 8,
});

export const contentRoot = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

export const iconPicker = style({
  border: `1px solid ${cssVarV2.layer.insideBorder.border}`,
  width: 32,
  height: 32,
  padding: 0,
  flexShrink: 0,
  fontSize: 24,
  borderRadius: 4,
  selectors: {
    '&[data-icon-type="emoji"]': {
      fontSize: 20,
    },
  },
});

export const input = style({
  height: 32,
  borderRadius: 4,
  width: 0,
  flexGrow: 1,
});

export const emojiPickerPopover = style({
  padding: 0,
});

globalStyle('em-emoji-picker', {
  vars: {
    '--shadow': 'none',
    '--font-family': cssVar('fontFamily'),
  },
});

globalStyle('em-emoji-picker #root', {
  background: 'transparent',
});
