import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { ChartBuilderFilters } from '@/components/charts/ChartBuilderFilters';
import { ChartBuilderRail } from '@/components/charts/ChartBuilderRail';
import { ChartCard } from '@/components/charts/ChartCard';
import type { ChartCardAction } from '@/components/charts/ChartCard.types';
import { RenameChartDialog } from '@/components/charts/RenameChartDialog';
import { Button } from '@/components/ui/button';
import { COMING_SOON_MESSAGE } from '@/constants/feedback';
import { ROUTES, chartBuilderPath, conversationPath } from '@/constants/routes';
import type { BudChatMessage, GraphDraftSource } from '@/features/bud/bud.engine.types';
import { EMPTY_THREAD, getActiveSpec } from '@/features/bud/bud.store';
import type { GraphSpecPatch, GraphType } from '@/features/bud/bud.types';
import { toDashboardChart } from '@/features/bud/graphSpec.utils';
import {
  builderRailTitle,
  builderThreadKey,
  draftCanvasTitle,
  lastExchangeForGraph,
} from '@/features/charts/charts.builder';
import { NEW_CHART_FOOTER } from '@/features/charts/charts.constants';
import {
  BUILDER_CHART_FOOTER,
  BUD_CREATE_WELCOME,
  TEMPLATE_WELCOME,
  buildTemplateSpec,
} from '@/features/charts/charts.templates';
import { CHAT_STREAM_DELAY_MS } from '@/features/chat/chat.constants';
import { runChatTurn } from '@/features/chat/chat.turn';
import { isThreadStreaming } from '@/features/chat/chat.utils';
import { useBudSessionContext, useBudState, useChatSession } from '@/hooks/useChatSession';
import { useAddDashboardChart } from '@/hooks/useDashboardChartsQuery';
import type { ChartBuilderLocationState } from '@/types/navigation.types';

import { chartBuilderStyles as styles } from './ChartBuilder.styles';

function seedBudMessage(
  append: (threadKey: string, message: BudChatMessage) => void,
  threadKey: string,
  id: string,
  text: string,
  graphId?: string,
) {
  append(threadKey, {
    id,
    role: 'bud',
    text,
    status: 'done',
    graphIds: graphId ? [graphId] : [],
    redirectGraphId: null,
    confirmationGraphId: null,
  });
}

export function ChartBuilder() {
  const { graphId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const chat = useChatSession();
  const budState = useBudState(chat.store);
  const addDashboardChart = useAddDashboardChart();
  const builderContext = useBudSessionContext('builder');
  const navState = location.state as ChartBuilderLocationState | null;
  const conversationId = navState?.conversationId;
  const template = navState?.template;
  const fromChat = Boolean(conversationId);
  const draftSource: GraphDraftSource = template ? 'dashboard' : 'chat';
  const [pendingKey] = useState(() => `builder:pending:${crypto.randomUUID()}`);
  const [composer, setComposer] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [creating, setCreating] = useState(() => Boolean(template && !graphId));
  const bootstrapped = useRef(false);

  const threadKey = graphId ? builderThreadKey(graphId) : pendingKey;
  const draft = graphId ? (budState.drafts[graphId] ?? null) : null;
  const spec = graphId ? getActiveSpec(draft ?? undefined) : null;
  const thread = budState.threads[threadKey] ?? EMPTY_THREAD;
  const streaming = isThreadStreaming(thread.messages);
  const executor = chat.executorFor(threadKey, draftSource);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const createFromTemplate = async (tipo: GraphType) => {
      const outcome = await executor.createGraph(buildTemplateSpec(tipo), builderContext);
      if (!outcome.ok || outcome.nome !== 'criar_grafico') {
        setCreating(false);
        toast.error(outcome.ok ? 'Não consegui montar o gráfico.' : outcome.mensagem);
        navigate(ROUTES.charts, { replace: true });
        return;
      }

      const id = outcome.dados.id;
      const nextKey = builderThreadKey(id);
      chat.store.replaceThread(nextKey, {
        ...chat.store.getThread(threadKey),
        focusGraphId: id,
      });
      seedBudMessage(
        chat.store.appendMessage,
        nextKey,
        chat.createId(),
        TEMPLATE_WELCOME(tipo),
        id,
      );
      navigate(chartBuilderPath(id), { replace: true, state: navState });
    };

    if (!graphId) {
      if (template) {
        void createFromTemplate(template);
        return;
      }
      if (chat.store.getThread(pendingKey).messages.length === 0) {
        seedBudMessage(chat.store.appendMessage, pendingKey, chat.createId(), BUD_CREATE_WELCOME);
      }
      return;
    }

    chat.store.updateThread(threadKey, { focusGraphId: graphId });
    if (chat.store.getThread(threadKey).messages.length > 0) return;

    if (conversationId) {
      const copied = lastExchangeForGraph(chat.store.getThread(conversationId).messages, graphId);
      if (copied.length > 0) {
        chat.store.replaceThread(threadKey, {
          ...EMPTY_THREAD,
          messages: copied,
          focusGraphId: graphId,
        });
        return;
      }
    }

    if (spec) {
      seedBudMessage(
        chat.store.appendMessage,
        threadKey,
        chat.createId(),
        TEMPLATE_WELCOME(spec.tipo),
        graphId,
      );
    }
  }, [
    builderContext,
    chat,
    conversationId,
    executor,
    graphId,
    navState,
    pendingKey,
    spec,
    template,
    threadKey,
    navigate,
  ]);

  const adoptCreatedGraph = (id: string) => {
    if (graphId) return;
    const nextKey = builderThreadKey(id);
    chat.store.replaceThread(nextKey, {
      ...chat.store.getThread(threadKey),
      focusGraphId: id,
    });
    navigate(chartBuilderPath(id), { replace: true, state: navState });
  };

  const handlePatch = async (patch: GraphSpecPatch) => {
    if (!graphId) return;
    const outcome = await executor.execute(
      { id: chat.createId(), nome: 'ajustar_grafico', argumentos: { id: graphId, patch } },
      { ...builderContext, grafico_em_foco: spec, tela_atual: 'builder' },
    );
    if (!outcome.ok) toast.error(outcome.mensagem);
  };

  const handleSubmit = (text: string) => {
    setComposer('');
    void runChatTurn({
      session: chat,
      threadKey,
      text,
      baseContext: { ...builderContext, tela_atual: 'builder' },
      streamDelayMs: CHAT_STREAM_DELAY_MS,
    }).then((result) => {
      const created = result?.graphIds.at(-1);
      if (created) adoptCreatedGraph(created);
    });
  };

  const handleSave = async () => {
    if (!graphId || !spec) return;
    const dashboardId = crypto.randomUUID();
    await addDashboardChart(
      toDashboardChart(spec, { id: dashboardId, footer: NEW_CHART_FOOTER, isNew: true }),
    );
    chat.store.setDraftStatus(graphId, 'saved', dashboardId);
    navigate(ROUTES.charts, { state: { savedChartId: dashboardId } });
  };

  const handleDiscard = () => {
    if (graphId) chat.store.setDraftStatus(graphId, 'discarded');
    navigate(conversationId ? conversationPath(conversationId) : ROUTES.charts);
  };

  const handleAction = (action: ChartCardAction) => {
    if (action === 'delete') {
      handleDiscard();
      return;
    }
    if (action === 'rename') {
      setRenaming(true);
      return;
    }
    toast.info(COMING_SOON_MESSAGE);
  };

  if (graphId && (!spec || draft?.status === 'discarded')) {
    return <Navigate to={ROUTES.charts} replace />;
  }

  const chart =
    spec && graphId ? toDashboardChart(spec, { id: graphId, footer: BUILDER_CHART_FOOTER }) : null;

  return (
    <div className={styles.root}>
      <ChartBuilderRail
        title={builderRailTitle(spec, fromChat)}
        fromChat={fromChat}
        messages={thread.messages}
        draft={draft}
        streaming={streaming}
        composerValue={composer}
        onComposerChange={setComposer}
        onSubmit={handleSubmit}
        onSelectVersion={(index) => {
          if (graphId) chat.store.setActiveVersion(graphId, index);
        }}
      />

      <section className={styles.canvas}>
        <header className={styles.canvasHeader}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>
              {spec ? draftCanvasTitle(spec.titulo) : 'Novo gráfico'}
            </h1>
            {spec ? (
              <Button
                variant="quiet"
                size="icon-xs"
                className={styles.rename}
                aria-label="Renomear gráfico"
                onClick={() => setRenaming(true)}
              >
                <Pencil />
              </Button>
            ) : null}
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={handleDiscard}>
              Descartar
            </Button>
            <Button onClick={() => void handleSave()} disabled={!spec}>
              Salvar no dashboard
            </Button>
          </div>
        </header>

        {spec ? (
          <ChartBuilderFilters
            spec={spec}
            roster={chat.roster}
            onPatch={(patch) => void handlePatch(patch)}
          />
        ) : null}

        <div className={styles.stage}>
          {chart ? (
            <ChartCard chart={chart} onAction={handleAction} className={styles.card} showAxis />
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>
                {creating ? 'Montando o gráfico' : 'Ainda sem rascunho'}
              </p>
              <p className={styles.emptyText}>
                {creating
                  ? 'O modelo já está indo para o canvas. Você pode pedir ajustes no chat em seguida.'
                  : 'Descreva o gráfico no chat ao lado. O Bud monta o modelo e você ajusta os filtros.'}
              </p>
            </div>
          )}
        </div>
      </section>

      <RenameChartDialog
        chartTitle={renaming && spec ? spec.titulo : null}
        onCancel={() => setRenaming(false)}
        onConfirm={(title) => {
          if (graphId) chat.store.renameDraft(graphId, title);
          setRenaming(false);
        }}
      />
    </div>
  );
}
