import { cva } from 'class-variance-authority';

export const voiceOrbVariants = cva(
  'group/orb relative shrink-0 rounded-full transition-[width,height,box-shadow,filter,opacity] duration-500 motion-reduce:animate-none',
  {
    variants: {
      size: {
        lg: 'size-[170px] shadow-[0_0_90px_0_color-mix(in_oklab,var(--mint)_40%,transparent)]',
        sm: 'size-[76px] shadow-[0_0_50px_0_color-mix(in_oklab,var(--mint)_35%,transparent)]',
      },
      state: {
        listening: 'animate-orb-breathe',
        user: 'animate-orb-talk [animation-duration:1.4s]',
        speaking: 'animate-orb-talk',
        thinking: 'animate-orb-breathe [animation-duration:1.6s]',
        muted: 'opacity-70 grayscale-[0.5]',
      },
    },
  },
);

export const voiceOrbBlobVariants = cva(
  'absolute rounded-full motion-reduce:animate-none group-data-[state=speaking]/orb:[animation-duration:2.6s] group-data-[state=thinking]/orb:[animation-duration:3.4s] group-data-[state=muted]/orb:[animation-play-state:paused]',
  {
    variants: {
      size: {
        lg: 'blur-[26px]',
        sm: 'blur-[12px]',
      },
    },
  },
);

export const voiceOrbStyles = {
  surface: 'absolute inset-0 overflow-hidden rounded-full bg-orb-base',
  deep: 'top-[45%] -left-1/4 size-[85%] animate-orb-deep bg-orb-deep',
  light: 'top-[-25%] left-[34.5%] h-3/4 w-[95%] animate-orb-light bg-orb-light',
  sky: 'top-[38%] left-[10%] size-[60%] animate-orb-sky bg-orb-sky',
} as const;
