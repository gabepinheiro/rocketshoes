import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });

  const addProduct = async (productId: number) => {
    const productExistsId = cart.findIndex(product => product.id === productId)

    if(productExistsId !== -1) {
      const tempCart = [...cart]
      tempCart[productExistsId].amount++

      try {
        const { data } = await api.get<Stock>(`/stock/${productId}`)
        const { amount: amountInStock  } = data

        const amountProductInCart = tempCart[productExistsId].amount

        if (amountProductInCart > amountInStock) {
          toast.error('Quantidade solicitada fora de estoque');
          return
        }

      } catch (error) {
        toast.error('Quantidade solicitada fora de estoque');
      }

      return setCart([...tempCart])
    }

    try {
      const { data } = await api.get(`/products/${productId}`)
      
      setCart(cart => cart.concat({ ...data, amount: 1 }))
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
