import {
  ArrowUp,
  AudioLines,
  Bell,
  Calendar,
  ChartColumn,
  CircleUser,
  GripVertical,
  LogOut,
  Maximize2,
  MessageCircle,
  Mic,
  Minimize2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  SquarePen,
  Trash2,
  type LucideIcon,
} from 'lucide-react';

export const ICON_STROKE_WIDTH = 2;

export const APP_ICONS = {
  'message-circle': MessageCircle,
  'chart-column': ChartColumn,
  'circle-user': CircleUser,
  search: Search,
  plus: Plus,
  'square-pen': SquarePen,
  mic: Mic,
  'audio-lines': AudioLines,
  'arrow-up': ArrowUp,
  'grip-vertical': GripVertical,
  'maximize-2': Maximize2,
  'minimize-2': Minimize2,
  'trash-2': Trash2,
  pencil: Pencil,
  sparkles: Sparkles,
  calendar: Calendar,
  bell: Bell,
  'log-out': LogOut,
} as const satisfies Record<string, LucideIcon>;

export type AppIconName = keyof typeof APP_ICONS;
