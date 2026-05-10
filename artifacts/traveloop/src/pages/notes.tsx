import { useLocation, useParams } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Edit, FileText, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/sidebar";
import { RequireAuth } from "@/lib/auth-context";
import {
  useListTripNotes, useCreateTripNote, useUpdateTripNote, useDeleteTripNote,
  getListTripNotesQueryKey, useGetTrip, getGetTripQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { getToken } from "@/lib/api";

function NotesContent() {
  const { tripId } = useParams<{ tripId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = Number(tripId);

  const [newNote, setNewNote] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showNew, setShowNew] = useState(false);

  const { data: trip } = useGetTrip(id, { query: { enabled: !!id && !!getToken(), queryKey: getGetTripQueryKey(id) } });
  const { data: notes = [], isLoading } = useListTripNotes(id, { query: { enabled: !!id && !!getToken(), queryKey: getListTripNotesQueryKey(id) } });
  const createMutation = useCreateTripNote();
  const updateMutation = useUpdateTripNote();
  const deleteMutation = useDeleteTripNote();

  const handleCreate = async () => {
    if (!newNote.trim()) return;
    try {
      await createMutation.mutateAsync({ tripId: id, data: { content: newNote.trim() } });
      queryClient.invalidateQueries({ queryKey: getListTripNotesQueryKey(id) });
      setNewNote("");
      setShowNew(false);
      toast({ title: "Note saved!" });
    } catch {
      toast({ title: "Error", description: "Failed to save note.", variant: "destructive" });
    }
  };

  const handleUpdate = async (noteId: number) => {
    try {
      await updateMutation.mutateAsync({ tripId: id, noteId, data: { content: editContent } });
      queryClient.invalidateQueries({ queryKey: getListTripNotesQueryKey(id) });
      setEditId(null);
      toast({ title: "Note updated!" });
    } catch {
      toast({ title: "Error", description: "Failed to update note.", variant: "destructive" });
    }
  };

  const handleDelete = async (noteId: number) => {
    try {
      await deleteMutation.mutateAsync({ tripId: id, noteId });
      queryClient.invalidateQueries({ queryKey: getListTripNotesQueryKey(id) });
    } catch {
      toast({ title: "Error", description: "Failed to delete note.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/trips/${id}`)} className="mb-4 gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Trip
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Trip Notes</h1>
              {trip && <p className="text-muted-foreground text-sm">{trip.name}</p>}
            </div>
          </div>
          <Button onClick={() => { setShowNew(!showNew); }} className="teal-gradient border-0 text-white gap-2" data-testid="button-new-note">
            <Plus className="w-4 h-4" /> New Note
          </Button>
        </div>

        {/* New note form */}
        <AnimatePresence>
          {showNew && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4">
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <Textarea
                    placeholder="Write your note here..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="resize-none min-h-24"
                    autoFocus
                    data-testid="textarea-new-note"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => { setShowNew(false); setNewNote(""); }}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="teal-gradient border-0 text-white gap-1.5" onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-save-note">
                      {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
          </div>
        ) : notes.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-10 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">No notes yet</p>
              <p className="text-sm text-muted-foreground">Jot down hotel check-in info, local contacts, reminders...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notes.map((note, i) => (
              <motion.div key={note.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/60" data-testid={`card-note-${note.id}`}>
                  <CardContent className="p-4">
                    {editId === note.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="resize-none min-h-20"
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setEditId(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="teal-gradient border-0 text-white gap-1.5" onClick={() => handleUpdate(note.id)} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap mb-3">{note.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{format(parseISO(note.createdAt), "MMM d, yyyy · h:mm a")}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => { setEditId(note.id); setEditContent(note.content); }} data-testid={`button-edit-note-${note.id}`}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(note.id)} data-testid={`button-delete-note-${note.id}`}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <NotesContent />
      </AppLayout>
    </RequireAuth>
  );
}
