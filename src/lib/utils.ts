import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display',
        'title',
        'headline',
        'subhead',
        'lead',
        'message',
        'prompt',
        'body-lg',
        'ui',
        'copy',
        'ui-sm',
        'small',
        'caption',
        'meta',
        'overline',
        'micro',
      ],
      radius: ['field', 'panel'],
      shadow: ['overlay'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
