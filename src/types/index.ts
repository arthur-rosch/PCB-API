interface Client {
  name: string;
  document: string;
  phoneNumber?: string;
  email: string;
  address?: {
    codIbge?: string;
    street: string;
    number: string;
    complement?: string;
    zipCode: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

interface Product {
  description: string;
  quantity: number;
  value: number;
}

interface Split {
  username: string;
  percentageSplit: number;
}

export interface PixRequest {
  requestNumber: string;
  dueDate: string; // Formato AAAA-MM-DD
  amount: number;
  value: number;
  shippingAmount?: number;
  usernameCheckout?: string;
  callbackUrl?: string;
  description: string;
  quantity: number;
  client: Client;
  products?: Product[];
  split?: Split;
}
