import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, content: string, color: string) => void;
  isCreating?: boolean;
}

const colors = [
  { name: 'yellow', class: 'bg-gradient-to-br from-yellow-100 to-yellow-200', hex: '#FEF3C7' },
  { name: 'blue', class: 'bg-gradient-to-br from-blue-100 to-blue-200', hex: '#DBEAFE' },
  { name: 'green', class: 'bg-gradient-to-br from-green-100 to-green-200', hex: '#DCFCE7' },
  { name: 'pink', class: 'bg-gradient-to-br from-pink-100 to-pink-200', hex: '#FCE7F3' },
  { name: 'purple', class: 'bg-gradient-to-br from-purple-100 to-purple-200', hex: '#F3E8FF' },
];

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  isCreating = false 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onCreate(title.trim(), content.trim(), selectedColor);
      setTitle('');
      setContent('');
      setSelectedColor('yellow');
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setSelectedColor('yellow');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Create New Note</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter note title..."
              maxLength={100}
              required
            />
            <div className="text-xs text-gray-500 mt-1">{title.length}/100 characters</div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Write your note here..."
              rows={6}
              maxLength={1000}
              required
            />
            <div className="text-xs text-gray-500 mt-1">{content.length}/1000 characters</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Color
            </label>
            <div className="flex gap-3">
              {colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${color.class} ${
                    selectedColor === color.name 
                      ? 'border-gray-400 ring-2 ring-purple-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim() || isCreating}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? 'Creating...' : (
                <>
                  <Plus size={16} />
                  Create Note
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};