import { useLayoutEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

import { PLACEHOLDER_DATA_NOTICE } from '@/features/bud/bud.constants';
import { toDashboardChart } from '@/features/bud/graphSpec.utils';
import {
  CHAT_AUTOSCROLL_THRESHOLD_PX,
  CHAT_REDIRECTING_LABEL,
} from '@/features/chat/chat.constants';
import { resolveGraphSpec, splitMessageParagraphs } from '@/features/chat/chat.utils';

import { ChatAttachmentChip } from './ChatAttachmentChip';
import { ChatInlineChart } from './ChatInlineChart';
import { chatThreadStyles as styles } from './ChatThread.styles';
import type { ChatThreadMessageProps, ChatThreadProps } from './ChatThread.types';

function ChatThreadMessage({
  message,
  drafts,
  onOpenGraph,
  onChartAction,
}: ChatThreadMessageProps) {
  if (message.role === 'user') {
    const attachments = message.attachments ?? [];
    if (!message.text.trim() && attachments.length === 0) return null;

    return (
      <li className={styles.userBlock}>
        {attachments.length > 0 ? (
          <ul className={styles.userAttachments} aria-label="Anexos enviados">
            {attachments.map((attachment) => (
              <li key={attachment.id}>
                <ChatAttachmentChip attachment={attachment} />
              </li>
            ))}
          </ul>
        ) : null}
        {message.text.trim() ? <p className={styles.user}>{message.text}</p> : null}
      </li>
    );
  }

  const paragraphs = splitMessageParagraphs(message.text);
  const showCharts = Boolean(message.graphIds.length && !message.redirectGraphId);
  const charts = showCharts
    ? message.graphIds.flatMap((graphId) => {
        const spec = resolveGraphSpec(drafts, graphId, message.graphVersionIndexes?.[graphId]);
        return spec
          ? [toDashboardChart(spec, { id: graphId, footer: PLACEHOLDER_DATA_NOTICE })]
          : [];
      })
    : [];

  if (!message.text.trim() && charts.length === 0 && !message.redirectGraphId) return null;

  const [lead, ...rest] = paragraphs;

  return (
    <li className={styles.bud}>
      {lead ? (
        <p className={styles.budLead}>
          {lead}
          {message.status === 'streaming' && rest.length === 0 ? (
            <span className={styles.caret} aria-hidden />
          ) : null}
        </p>
      ) : null}
      {rest.map((paragraph, index) => (
        <p key={`${message.id}-${index}`} className={styles.budBody}>
          {paragraph}
          {message.status === 'streaming' && index === rest.length - 1 ? (
            <span className={styles.caret} aria-hidden />
          ) : null}
        </p>
      ))}
      {charts.length > 0 ? (
        <div className={styles.charts}>
          {charts.map((chart) => (
            <ChatInlineChart
              key={chart.id}
              chart={chart}
              onOpen={() => onOpenGraph(chart.id)}
              onAction={(action) => onChartAction(action, chart.id)}
            />
          ))}
        </div>
      ) : null}
      {message.redirectGraphId ? (
        <button
          type="button"
          className={styles.redirect}
          onClick={() => onOpenGraph(message.redirectGraphId ?? '')}
        >
          <ChevronRight className="size-3" aria-hidden />
          {CHAT_REDIRECTING_LABEL}
        </button>
      ) : null}
    </li>
  );
}

export function ChatThread({ messages, drafts, onOpenGraph, onChartAction }: ChatThreadProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !stickToBottomRef.current) return;
    root.scrollTop = root.scrollHeight;
  }, [messages]);

  if (messages.length === 0) return <div className={styles.root} />;

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onScroll={() => {
        const root = rootRef.current;
        if (!root) return;
        stickToBottomRef.current =
          root.scrollHeight - root.scrollTop - root.clientHeight < CHAT_AUTOSCROLL_THRESHOLD_PX;
      }}
    >
      <ol className={styles.list} aria-label="Mensagens da conversa" aria-live="polite">
        {messages.map((message) => (
          <ChatThreadMessage
            key={message.id}
            message={message}
            drafts={drafts}
            onOpenGraph={onOpenGraph}
            onChartAction={onChartAction}
          />
        ))}
      </ol>
    </div>
  );
}
