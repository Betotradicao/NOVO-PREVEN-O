import { useState } from 'react';

export default function NumericKeypad({ isOpen, onClose, onSubmit, title = 'Digite o código' }) {
  const [value, setValue] = useState('');

  const handleNumberClick = (num) => {
    setValue(prev => prev + num);
  };

  const handleBackspace = () => {
    setValue(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setValue('');
  };

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value);
      setValue('');
      onClose();
    }
  };

  const handleCancel = () => {
    setValue('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        {/* Display */}
        <div className="p-6">
          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 mb-6">
            <input
              type="text"
              value={value}
              readOnly
              placeholder="Digite o código..."
              className="w-full text-2xl font-mono text-center bg-transparent border-none focus:outline-none text-gray-900"
            />
          </div>

          {/* Keypad - Botões grandes do tamanho de um dedo */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 text-4xl font-bold py-6 rounded-xl transition active:scale-95 shadow-md min-h-[70px]"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white text-base font-semibold py-6 rounded-xl transition active:scale-95 shadow-md min-h-[70px]"
            >
              LIMPAR
            </button>
            <button
              onClick={() => handleNumberClick('0')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 text-4xl font-bold py-6 rounded-xl transition active:scale-95 shadow-md min-h-[70px]"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-2xl font-semibold py-6 rounded-xl transition active:scale-95 shadow-md min-h-[70px]"
            >
              ⌫
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!value.trim()}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
