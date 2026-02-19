import React from 'react';
import { X, Trash2, ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';
import { SmartImage } from './SmartImage';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateItem: (productId: string, quantity: number) => void;
  onCheckout: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateItem,
  onCheckout
}) => {
  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        <header className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart /> Your Cart
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <SmartImage
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-md border border-gray-200"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">KES {item.price?.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => onUpdateItem(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-sm"
                      >
                        -
                      </button>
                      <span className="px-3 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateItem(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onUpdateItem(item.id, 0)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <ShoppingCart size={48} className="mx-auto text-gray-300" />
              <p className="mt-4 text-gray-600">Your cart is empty.</p>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <footer className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700">Subtotal:</span>
              <span className="text-xl font-bold text-gray-900">KES {total.toLocaleString()}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
            >
              Checkout with M-Pesa
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};
