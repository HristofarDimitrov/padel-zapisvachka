import React, { useState } from 'react';
import { Trash2, Edit3, Save, X } from 'lucide-react';
import { Note } from '../types/Note';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string, content: string) => void;
  isDeleting?: boolean;
}

const colorClasses = {
  yellow: 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300',
  blue: 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300',
  green: 'bg-gradient-to-br from-green-100 to-green-200 border-green-300',
  pink: 'bg-gradient-to-br from-pink-100 to-pink-200 border-pink-300',
  purple: 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300',
};

export const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onDelete, 
  onUpdate, 
  isDeleting = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    if (editTitle.trim() && editContent.trim()) {
      onUpdate(note.id, editTitle.trim(), editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  const colorClass = colorClasses[note.color as keyof typeof colorClasses] || colorClasses.yellow;

  return (
    <div 
      className={`${colorClass} border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
        isDeleting ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-xl font-bold bg-transparent border-none outline-none w-full mr-2 placeholder-gray-600"
            placeholder="Note title..."
            maxLength={100}
          />
        ) : (
          <h3 className="text-xl font-bold text-gray-800 line-clamp-2">
            {note.title}
          </h3>
        )}
        
        <div className="flex gap-2 ml-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={!editTitle.trim() || !editContent.trim()}
                className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors text-gray-700"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                disabled={isDeleting}
                className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full h-32 bg-transparent border-none outline-none resize-none placeholder-gray-600"
          placeholder="Write your note here..."
          maxLength={1000}
        />
      ) : (
        <p className="text-gray-700 leading-relaxed line-clamp-4 mb-4">
          {note.content}
        </p>
      )}

      <div className="text-xs text-gray-600 pt-2 border-t border-gray-300">
        {isEditing ? (
          <span>{editContent.length}/1000 characters</span>
        ) : (
          <span>Updated {note.updatedAt.toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};