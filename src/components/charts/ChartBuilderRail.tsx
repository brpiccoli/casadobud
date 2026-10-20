import { useLayoutEffect, useRef } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';

import { ChatComposer } from '@/components/chat/ChatComposer';
import { Chip } from '@/components/ui/chip';
import { Tag } from '@/components/ui/tag';
import { versionChipLabel } from '@/features/charts/charts.builder';
import { isThreadStreaming } from '@/features/chat/chat.utils';

import { chartBuilderRailStyles as styles } from './ChartBuilderRail.styles';
import type { ChartBuilderRailProps } from './ChartBuilderRail.types';

export function ChartBuilderRail({
  title,
  fromChat,
  messages,
  draft,
  streaming,
  composerValue,
  onComposerChange,
  onSubmit,
  onSelectVersion,
}: ChartBuilderRailProps) {
  const threadRef = useRef<HTMLDivElement>(null);
  const busy = streaming || isThreadStreaming(messages);

  useLayoutEffect(() => {
    const root = threadRef.current;
    if (!root) return;
    root.scrollTop = root.scrollHeight;
  }, [messages]);

  return (
    <aside className={styles.root}>
      <header className={styles.header}>
        <Tag tone="accent" className={styles.chip}>
          {fromChat ? (
            <ChevronRight className={styles.chipIcon} aria-hidden />
          ) : (
            <Sparkles className={styles.chipIcon} aria-hidden />
          )}
          {fromChat ? 'Vindo do Chat' : 'Novo gráfico'}
        </Tag>
        <h2 className={styles.title}>{title}</h2>
      </header>

      <div ref={threadRef} className={styles.thread}>
        {messages.map((message) => {
          if (!message.text.trim()) return null;
          return (
            <p key={message.id} className={message.role === 'user' ? styles.user : styles.bud}>
              {message.text}
            </p>
          );
        })}
      </div>

      {draft ? (
        <div className={styles.versions}>
          <p className={styles.versionsLabel}>Versões</p>
          <div className={styles.versionRow} role="list" aria-label="Versões do gráfico">
            {draft.versionLabels.map((label, index) => (
              <Chip
                key={`${label}-${index}`}
                size="sm"
                selected={index === draft.activeIndex}
                onClick={() => onSelectVersion(index)}
              >
                {versionChipLabel(index, label)}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.composer}>
        <ChatComposer
          layout="rail"
          value={composerValue}
          onChange={onComposerChange}
          onSubmit={onSubmit}
          placeholder="Peça um ajuste"
          compactPlaceholder="Peça um ajuste"
          disabled={busy}
        />
      </div>
    </aside>
  );
}
