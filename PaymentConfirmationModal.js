import React from 'react';

const PaymentConfirmationModal = ({ program, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Confirm Purchase</h2>
        <p className="mb-4 text-gray-300">
          Are you sure you want to buy the <strong className="text-purple-400">{program.name}</strong> program?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            onClick={onConfirm}
          >
            Confirm & Pay
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;