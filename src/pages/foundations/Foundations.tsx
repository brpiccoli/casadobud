import { useState } from 'react';
import { Calendar, ChartColumn, ChevronDown, Ellipsis, Mail, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { AuthField } from '@/components/auth/AuthField';
import { BudWordmark } from '@/components/brand/BudWordmark';
import { ChartCardFrame } from '@/components/charts/ChartCardFrame';
import { ChartVisual } from '@/components/charts/ChartVisual';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Tag } from '@/components/ui/tag';
import { APP_ICONS, type AppIconName } from '@/constants/icons';
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';
import {
  ANATOMY_CHART,
  COLOR_SWATCHES,
  TYPE_SCALE,
} from '@/features/foundations/foundations.constants';
import { useCssVariable } from '@/hooks/useCssVariable';
import { cn } from '@/lib/utils';

import { foundationsStyles as styles } from './Foundations.styles';
import type { FoundationsPanelProps, SwatchProps } from './Foundations.types';

const THEME_OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'dark', label: 'Escuro' },
  { mode: 'light', label: 'Claro' },
];

const ICON_NAMES = Object.keys(APP_ICONS) as AppIconName[];

function Panel({ title, children }: FoundationsPanelProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ swatch }: SwatchProps) {
  const value = useCssVariable(swatch.cssVar);

  return (
    <li className={styles.swatch}>
      <span className={cn(styles.swatchColor, swatch.className)} aria-hidden />
      <span className={styles.swatchLabel}>{swatch.label}</span>
      <code className={styles.swatchValue}>{value || swatch.cssVar}</code>
    </li>
  );
}

function ColorsPanel() {
  return (
    <Panel title="Cores">
      <ul className={styles.swatches}>
        {COLOR_SWATCHES.map((swatch) => (
          <Swatch key={swatch.cssVar} swatch={swatch} />
        ))}
      </ul>
    </Panel>
  );
}

function TypographyPanel() {
  return (
    <Panel title="Tipografia">
      <div>
        <p className={styles.typeHero}>O que você tem em mente?</p>
        <p className={styles.typeCaption}>Fraunces Regular · display e títulos</p>
        <p className={styles.typeBody}>
          O Bud acompanha o time todos os dias e transforma as conversas em sinais que você consegue
          ler em minutos.
        </p>
        <p className={styles.typeCaption}>Instrument Sans · corpo e interface</p>
        <p className={styles.typeTag}>Chips e labels em uppercase</p>
      </div>
      <ul className={styles.typeScale}>
        {TYPE_SCALE.map((item) => (
          <li key={item.token} className={styles.typeRow}>
            <code className={styles.typeToken}>text-{item.token}</code>
            <span className={cn(styles.typeSample, item.className)}>{item.sample}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function ButtonsPanel() {
  const [primarySwitch, setPrimarySwitch] = useState(true);
  const [secondarySwitch, setSecondarySwitch] = useState(false);

  return (
    <Panel title="Botões e chips">
      <div className={styles.row}>
        <Button>Entrar</Button>
        <Button variant="ghost">
          <Pencil />
          Editar layout
        </Button>
      </div>
      <div className={styles.row}>
        <Button variant="accent">
          <ChartColumn />
          Abrir nos Gráficos
        </Button>
      </div>
      <div className={styles.row}>
        <Chip>
          <Calendar />
          Últimos 30 dias
          <ChevronDown />
        </Chip>
        <Tag>Pré-definido</Tag>
        <Tag tone="accent">Personalizado</Tag>
      </div>
      <div className={styles.row}>
        <Switch
          checked={primarySwitch}
          onCheckedChange={setPrimarySwitch}
          aria-label="Exemplo de toggle ligado"
        />
        <Switch
          checked={secondarySwitch}
          onCheckedChange={setSecondarySwitch}
          aria-label="Exemplo de toggle desligado"
        />
        <Chip size="sm" selected>
          v2 · barras
        </Chip>
      </div>
    </Panel>
  );
}

function InputsPanel() {
  const [draft, setDraft] = useState('');

  return (
    <Panel title="Inputs">
      <div className={styles.inputs}>
        <AuthField label="Email" icon={Mail} type="email" placeholder="bruno@clube.com.br" />
        <div className={styles.composer}>
          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSubmit={() => setDraft('')}
            onAddAttachments={() => undefined}
            onDictate={() => undefined}
            onStartVoice={() => undefined}
          />
        </div>
      </div>
    </Panel>
  );
}

function IconsPanel() {
  return (
    <Panel title="Ícones · Lucide">
      <ul className={styles.icons}>
        {ICON_NAMES.map((name) => {
          const Icon = APP_ICONS[name];
          return (
            <li key={name} className={styles.iconCell}>
              <Icon className="size-4.5" aria-hidden />
              <span className={styles.iconLabel}>{name}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function ChartAnatomyPanel() {
  return (
    <Panel title="Anatomia do chart-card">
      <ChartCardFrame
        className={styles.anatomyCard}
        title={ANATOMY_CHART.title}
        footer={ANATOMY_CHART.footer}
        tag={<Tag>Pré-definido</Tag>}
        menu={
          <Button
            variant="quiet"
            size="icon-xs"
            className={styles.anatomyMenu}
            aria-label="Opções do gráfico"
          >
            <Ellipsis />
          </Button>
        }
      >
        <ChartVisual chart={ANATOMY_CHART} />
      </ChartCardFrame>
      <p className={styles.anatomyNote}>
        <span className={styles.anatomyHighlight}>Header</span> com tag de origem, título e menu ·{' '}
        <span className={styles.anatomyHighlight}>corpo</span> com o gráfico ·{' '}
        <span className={styles.anatomyHighlight}>rodapé</span> com metadados.
      </p>
    </Panel>
  );
}

function OverlaysPanel() {
  const showToast = () => {
    toast.success('Gráfico salvo no dashboard', {
      description: 'Ele aparece em Gráficos com a tag Personalizado.',
      action: { label: 'Desfazer', onClick: () => undefined },
    });
  };

  return (
    <Panel title="Avatar, toast, popover e modal">
      <div className={styles.row}>
        <Avatar size="sm">
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
      </div>
      <div className={styles.row}>
        <Button variant="ghost" onClick={showToast}>
          Mostrar toast
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost">Abrir popover</Button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <PopoverHeader>
              <PopoverTitle>Período do dashboard</PopoverTitle>
              <PopoverDescription>Vale para todos os gráficos desta tela.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">Abrir modal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir gráfico?</DialogTitle>
              <DialogDescription>
                “Título do gráfico” sai do dashboard. Você pode desfazer logo em seguida.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancelar</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive">Excluir gráfico</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Panel>
  );
}

export function Foundations() {
  const { mode, setMode } = useTheme();

  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <BudWordmark size="md" />
          <h1 className={styles.title}>Fundações</h1>
          <p className={styles.subtitle}>Tokens, componentes e ícones das telas.</p>
        </div>
        <div className={styles.themeSwitch} role="group" aria-label="Tema">
          {THEME_OPTIONS.map((option) => (
            <Chip
              key={option.mode}
              size="sm"
              selected={mode === option.mode}
              aria-pressed={mode === option.mode}
              onClick={() => void setMode(option.mode)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </header>

      <div className={styles.grid}>
        <ColorsPanel />
        <TypographyPanel />
        <ButtonsPanel />
        <InputsPanel />
        <IconsPanel />
        <ChartAnatomyPanel />
        <OverlaysPanel />
      </div>
    </main>
  );
}
