import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
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
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      setCart(JSON.parse(storagedCart))
    }
  }, [])

  const addProduct = async (productId: number) => {
    const productExistsId = cart.findIndex(product => product.id === productId)

    if(productExistsId !== -1) {
      const tempCart = [...cart]

      try {
        const { data } = await api.get<Stock>(`/stock/${productId}`)
        const { amount: amountInStock  } = data

        const amountIncrementProductInCart = tempCart[productExistsId].amount + 1

        if (amountIncrementProductInCart > amountInStock) {
          toast.error('Quantidade solicitada fora de estoque');
          return
        }

        tempCart[productExistsId].amount = amountIncrementProductInCart
        setCart([...tempCart])

        return localStorage.setItem('@RocketShoes:cart', JSON.stringify(tempCart))
      } catch (error) {
        toast.error('Quantidade solicitada fora de estoque');
      }
    }

    try {
      const { data } = await api.get(`/products/${productId}`)
      
      setCart(cart => cart.concat({ ...data, amount: 1 }))

      localStorage.setItem('@RocketShoes:cart', JSON.stringify([
        ...cart, {...data, amount: 1}
      ]))
    } catch {
      toast.error('Erro na adi????o do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const product = cart.find(product => product.id === productId)
  
      if(!product) {
        throw Error
      }

      setCart(cart => {
        const cartFiltered = cart.filter(product => product.id !== productId)
        
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartFiltered))

        return cartFiltered
      })
    } catch {
      toast.error('Erro na remo????o do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    if(amount <= 0) return

    try {
      const { data: stock } = await api.get<Stock>(`/stock/${productId}`)

      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      const tempCart = [...cart]

      const productIndex = tempCart.findIndex(product => product.id === productId)

      if(productIndex === -1) return

      tempCart[productIndex].amount = amount

      setCart([...tempCart])

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(tempCart))
    } catch (err) {
      console.log(err)
      toast.error('Erro na altera????o de quantidade do produto');
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
