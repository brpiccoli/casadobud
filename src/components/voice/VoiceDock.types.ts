export interface VoiceDockProps {
  value: string;
  muted: boolean;
  muteDisabled?: boolean;
  disabled?: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onToggleMute: () => void;
  onEnd: () => void;
}
