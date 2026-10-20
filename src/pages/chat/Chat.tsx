import { useEffect, useRef, useState } from 'react';
import { SquarePen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import type { ChartCardAction } from '@/components/charts/ChartCard.types';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { ChatConversationMenu } from '@/components/chat/ChatConversationMenu';
import { ChatDictationBar } from '@/components/chat/ChatDictationBar';
import { ChatThread } from '@/components/chat/ChatThread';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { COMING_SOON_MESSAGE } from '@/constants/feedback';
import { ROUTES, chartBuilderPath, conversationPath, voicePath } from '@/constants/routes';
import { CHAT_REDIRECT_DELAY_MS } from '@/features/bud/bud.constants';
import {
  CHAT_DISCLAIMER,
  CHAT_DICTATION_TITLE,
  CHAT_EMPTY_TITLE,
  CHAT_STREAM_DELAY_MS,
  CHAT_SUGGESTIONS,
  DICTATION_MESSAGES,
} from '@/features/chat/chat.constants';
import { runChatTurn, seedChatThread } from '@/features/chat/chat.turn';
import type { ChatAttachment } from '@/features/chat/chat.types';
import {
  appendTranscript,
  buildConversationTitle,
  buildStaffConversationFromThread,
  isThreadStreaming,
  listConversationGraphs,
} from '@/features/chat/chat.utils';
import { CONVERSATION_SEED_PROMPTS } from '@/features/conversations/conversations.mocks';
import { VOICE_COPY } from '@/features/voice/voice.constants';
import { useBudSessionContext, useBudState, useChatSession } from '@/hooks/useChatSession';
import { useDictation } from '@/hooks/useDictation';
import {
  useDeleteStaffConversationMutation,
  useSaveStaffConversationMutation,
} from '@/hooks/useStaffConversationMutations';
import { useStaffConversationsQuery } from '@/hooks/useStaffConversationsQuery';
import { formatLongWeekdayDate } from '@/utils/dateFormat';

import { chatPageStyles as styles } from './Chat.styles';

export function Chat() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const chat = useChatSession();
  const budState = useBudState(chat.store);
  const baseContext = useBudSessionContext('chat');
  const { data: conversations = [] } = useStaffConversationsQuery();
  const saveConversation = useSaveStaffConversationMutation();
  const deleteConversation = useDeleteStaffConversationMutation();
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [todayLabel] = useState(() => formatLongWeekdayDate(new Date()));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const redirectTimerRef = useRef<number | null>(null);
  const dictation = useDictation();

  useEffect(() => {
    if (!conversationId) return;
    const prompts = CONVERSATION_SEED_PROMPTS[conversationId];
    if (!prompts) return;
    void seedChatThread({ session: chat, threadKey: conversationId, prompts, baseContext });
  }, [baseContext, chat, conversationId]);

  useEffect(
    () => () => {
      if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
    },
    [],
  );

  const messages = conversationId ? (budState.threads[conversationId]?.messages ?? []) : [];
  const streaming = isThreadStreaming(messages);
  const hasThread = messages.length > 0;
  const dictating = dictation.isActive;

  const activeConversation = conversations.find(
    (conversation) => conversation.id === conversationId,
  );
  const graphs = listConversationGraphs(messages, budState.drafts);
  const firstUser = messages.find((message) => message.role === 'user');
  const headerTitle =
    activeConversation?.title ??
    (firstUser?.text ? buildConversationTitle(firstUser.text) : 'Nova conversa');

  const persistConversation = (id: string, title?: string) => {
    const previous = conversations.find((conversation) => conversation.id === id);
    const next = buildStaffConversationFromThread(id, chat.store.getThread(id), previous);
    saveConversation.mutate(title ? { ...next, title } : next);
  };

  const goToBuilder = (graphId: string, id: string) => {
    if (redirectTimerRef.current) {
      window.clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    navigate(chartBuilderPath(graphId), { state: { conversationId: id } });
  };

  const handleSubmit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const id = conversationId ?? crypto.randomUUID();
    const pendingAttachments = attachments;
    setDraft('');
    setAttachments([]);

    const turn = runChatTurn({
      session: chat,
      threadKey: id,
      text: trimmed,
      baseContext,
      attachments: pendingAttachments,
      streamDelayMs: CHAT_STREAM_DELAY_MS,
    });

    if (!conversationId) {
      saveConversation.mutate({
        id,
        title: buildConversationTitle(trimmed),
        preview: '',
        updatedAt: new Date().toISOString(),
      });
      navigate(conversationPath(id), { replace: true });
    }

    void turn.then((result) => {
      persistConversation(id);
      if (!result?.openBuilderGraphId) return;
      const graphId = result.openBuilderGraphId;
      redirectTimerRef.current = window.setTimeout(() => {
        goToBuilder(graphId, id);
      }, CHAT_REDIRECT_DELAY_MS);
    });
  };

  const handleStartVoice = async () => {
    const id = conversationId ?? crypto.randomUUID();
    if (!conversationId) {
      await saveConversation.mutateAsync({
        id,
        title: VOICE_COPY.conversationTitle,
        preview: '',
        updatedAt: new Date().toISOString(),
      });
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      // A tela de voz trata microfone negado ou indisponível.
    }
    navigate(voicePath(id));
  };

  const handleDictate = async () => {
    const result = await dictation.start();
    if (result === 'unsupported') toast.error(DICTATION_MESSAGES.unsupported);
    if (result === 'denied') toast.error(DICTATION_MESSAGES.denied);
  };

  const handleConfirmDictation = async () => {
    const transcript = await dictation.stop();
    if (!transcript) {
      toast.info(DICTATION_MESSAGES.empty);
      return;
    }
    setDraft((current) => appendTranscript(current, transcript));
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleSendDictation = async () => {
    const transcript = await dictation.stop();
    const next = appendTranscript(draft, transcript).trim();
    if (!next) {
      toast.info(DICTATION_MESSAGES.empty);
      return;
    }
    handleSubmit(next);
  };

  const handleRename = (title: string) => {
    if (!conversationId) return;
    persistConversation(conversationId, title);
    toast.success('Conversa renomeada.');
  };

  const handleDelete = () => {
    if (!conversationId) return;
    chat.store.removeThread(conversationId);
    deleteConversation.mutate(conversationId);
    navigate(ROUTES.chat);
  };

  const handleChartAction = (action: ChartCardAction, graphId: string) => {
    if (action === 'expand' && conversationId) {
      goToBuilder(graphId, conversationId);
      return;
    }
    toast.info(COMING_SOON_MESSAGE);
  };

  const handleOpenGraph = (graphId: string) => {
    const id = conversationId ?? graphId;
    goToBuilder(graphId, id);
  };

  const composer = dictating ? (
    <ChatDictationBar
      levels={dictation.levels}
      elapsedMs={dictation.elapsedMs}
      busy={dictation.status === 'transcribing'}
      onCancel={dictation.cancel}
      onConfirm={() => void handleConfirmDictation()}
      onSend={() => void handleSendDictation()}
    />
  ) : (
    <ChatComposer
      value={draft}
      onChange={setDraft}
      onSubmit={handleSubmit}
      attachments={attachments}
      onAddAttachments={(added) => setAttachments((current) => [...current, ...added])}
      onRemoveAttachment={(attachmentId) =>
        setAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId))
      }
      onDictate={() => void handleDictate()}
      onStartVoice={() => void handleStartVoice()}
      disabled={streaming}
      textareaRef={textareaRef}
    />
  );

  const showHero = !conversationId && !hasThread && !dictating;
  const composerClassName = dictating ? styles.dictationComposer : styles.composer;

  return (
    <div className={styles.root}>
      {conversationId ? (
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{headerTitle}</h1>
          <div className={styles.headerActions}>
            <Button
              variant="quiet"
              size="icon-sm"
              onClick={() => navigate(ROUTES.chat)}
              aria-label="Nova conversa"
            >
              <SquarePen />
            </Button>
            <ChatConversationMenu
              title={headerTitle}
              graphs={graphs}
              onRename={handleRename}
              onOpenGraph={handleOpenGraph}
              onDelete={handleDelete}
            />
          </div>
        </header>
      ) : null}

      {showHero ? (
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.date}>{todayLabel}</p>
            <h2 className={styles.title}>{CHAT_EMPTY_TITLE}</h2>
            {composer}
            <ul className={styles.suggestions} aria-label="Sugestões">
              {CHAT_SUGGESTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <Chip onClick={() => handleSubmit(label)}>
                    <Icon aria-hidden />
                    {label}
                  </Chip>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <div className={styles.thread}>
          {dictating && !hasThread ? (
            <div className={styles.hero}>
              <h2 className={styles.dictationTitle}>{CHAT_DICTATION_TITLE}</h2>
            </div>
          ) : (
            <ChatThread
              messages={messages}
              drafts={budState.drafts}
              onOpenGraph={handleOpenGraph}
              onChartAction={handleChartAction}
            />
          )}
          <div className={composerClassName}>{composer}</div>
        </div>
      )}

      {dictating ? null : <p className={styles.disclaimer}>{CHAT_DISCLAIMER}</p>}
    </div>
  );
}
