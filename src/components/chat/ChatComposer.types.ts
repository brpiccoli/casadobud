export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  onAttach?: () => void;
  onDictate?: () => void;
  onStartVoice?: () => void;
  placeholder?: string;
  compactPlaceholder?: string;
  disabled?: boolean;
}
