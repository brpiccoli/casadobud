import { useState } from 'react';
import { ChartColumn, Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CHAT_MENU_DELETE,
  CHAT_MENU_GRAPHS,
  CHAT_MENU_RENAME,
  CHAT_NO_GRAPHS_MESSAGE,
  CHAT_RENAME_MAX_LENGTH,
} from '@/features/chat/chat.constants';

import { chatConversationMenuStyles as styles } from './ChatConversationMenu.styles';
import type { ChatConversationMenuProps } from './ChatConversationMenu.types';

export function ChatConversationMenu({
  title,
  graphs,
  onRename,
  onOpenGraph,
  onDelete,
}: ChatConversationMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [graphsOpen, setGraphsOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(title);

  const openRename = () => {
    setRenameValue(title);
    setRenameOpen(true);
  };

  const handleViewGraphs = () => {
    if (graphs.length === 0) {
      toast.info(CHAT_NO_GRAPHS_MESSAGE);
      return;
    }
    setGraphsOpen(true);
  };

  const handleRename = () => {
    const next = renameValue.trim();
    if (!next) return;
    onRename(next.slice(0, CHAT_RENAME_MAX_LENGTH));
    setRenameOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="quiet" size="icon-sm" aria-label="Opções da conversa">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={styles.content}>
          <DropdownMenuItem className={styles.item} onSelect={openRename}>
            <Pencil />
            {CHAT_MENU_RENAME}
          </DropdownMenuItem>
          <DropdownMenuItem className={styles.item} onSelect={handleViewGraphs}>
            <ChartColumn />
            {CHAT_MENU_GRAPHS}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className={styles.item}
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 />
            {CHAT_MENU_DELETE}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear conversa</DialogTitle>
            <DialogDescription>O novo nome aparece no topo e na barra lateral.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="chat-rename">Nome</Label>
            <Input
              id="chat-rename"
              value={renameValue}
              maxLength={CHAT_RENAME_MAX_LENGTH}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                handleRename();
              }}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleRename} disabled={!renameValue.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={graphsOpen} onOpenChange={setGraphsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gráficos desta conversa</DialogTitle>
            <DialogDescription>
              Abra no builder para ajustar o que o Bud montou aqui.
            </DialogDescription>
          </DialogHeader>
          <ul className={styles.graphs}>
            {graphs.map((graph) => (
              <li key={graph.id}>
                <Button
                  variant="ghost"
                  className={styles.graphButton}
                  onClick={() => {
                    setGraphsOpen(false);
                    onOpenGraph(graph.id);
                  }}
                >
                  {graph.title}
                </Button>
              </li>
            ))}
          </ul>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              “{title}” sai da barra lateral. O histórico desta conversa não volta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false);
                onDelete();
              }}
            >
              Excluir conversa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
