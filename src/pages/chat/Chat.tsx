import { useMemo, useState } from 'react';
import { Ellipsis, SquarePen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { ChatComposer } from '@/components/chat/ChatComposer';
import { Button } from '@/components/ui/button';
import { COMING_SOON_MESSAGE } from '@/constants/feedback';
import { ROUTES } from '@/constants/routes';
import { CHAT_DISCLAIMER, CHAT_SUGGESTIONS } from '@/features/chat/chat.constants';
import { useStaffConversationsQuery } from '@/hooks/useStaffConversationsQuery';
import { formatLongWeekdayDate } from '@/utils/dateFormat';

import { chatPageStyles as styles } from './Chat.styles';

export function Chat() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { data: conversations = [] } = useStaffConversationsQuery();
  const [draft, setDraft] = useState('');

  const [todayLabel] = useState(() => formatLongWeekdayDate(new Date()));

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === conversationId),
    [conversations, conversationId],
  );

  const showComingSoon = () => {
    toast.info(COMING_SOON_MESSAGE);
  };

  const handleSubmit = () => {
    showComingSoon();
    setDraft('');
  };

  return (
    <div className={styles.root}>
      {activeConversation ? (
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{activeConversation.title}</h1>
          <div className={styles.headerActions}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate(ROUTES.chat)}
              aria-label="Nova conversa"
            >
              <SquarePen />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={showComingSoon}
              aria-label="Opções da conversa"
            >
              <Ellipsis />
            </Button>
          </div>
        </header>
      ) : null}

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.date}>{todayLabel}</p>
          <h2 className={styles.title}>O que você tem em mente?</h2>

          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSubmit={handleSubmit}
            onAttach={showComingSoon}
            onDictate={showComingSoon}
            onStartVoice={showComingSoon}
          />

          <ul className={styles.suggestions} aria-label="Sugestões">
            {CHAT_SUGGESTIONS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <Button
                  variant="pill"
                  size="sm"
                  className={styles.suggestion}
                  onClick={() => setDraft(label)}
                >
                  <Icon aria-hidden />
                  {label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className={styles.disclaimer}>{CHAT_DISCLAIMER}</p>
    </div>
  );
}
