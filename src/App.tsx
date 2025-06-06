import React, { useState, useEffect } from 'react';
import { Plus, FileText, Sparkles } from 'lucide-react';
import { Note } from './types/Note';
import { notesService } from './services/notesService';
import { NoteCard } from './components/NoteCard';
import { CreateNoteModal } from './components/CreateNoteModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedNotes = await notesService.getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      setError('Unable to load your notes. Please check your Firebase configuration.');
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (title: string, content: string, color: string) => {
    try {
      setIsCreating(true);
      await notesService.createNote({ title, content, color });
      await loadNotes(); // Refresh the notes list
      setIsModalOpen(false);
    } catch (error) {
      setError('Failed to create note. Please try again.');
      console.error('Error creating note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      setDeletingIds(prev => new Set(prev).add(id));
      await notesService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      setError('Failed to delete note. Please try again.');
      console.error('Error deleting note:', error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleUpdateNote = async (id: string, title: string, content: string) => {
    try {
      await notesService.updateNote(id, { title, content });
      setNotes(prev => 
        prev.map(note => 
          note.id === id 
            ? { ...note, title, content, updatedAt: new Date() }
            : note
        )
      );
    } catch (error) {
      setError('Failed to update note. Please try again.');
      console.error('Error updating note:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Firebase Notes
                </h1>
                <p className="text-sm text-gray-600">Your thoughts, organized beautifully</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              New Note
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={loadNotes} />
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : notes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto border border-white/20">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No notes yet</h3>
              <p className="text-gray-600 mb-8">Create your first note to get started on your journey!</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Plus size={20} />
                Create Your First Note
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDeleteNote}
                onUpdate={handleUpdateNote}
                isDeleting={deletingIds.has(note.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateNote}
        isCreating={isCreating}
      />
    </div>
  );
}

export default App;