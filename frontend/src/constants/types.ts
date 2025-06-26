export interface User {
  id: string;
  fullname: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversionData {
  date: string;
  USD: number;
  EUR: number;
  GBP: number;
  NGN: number;
}

export interface IConversionHistory {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  rate: number;
  createdAt: string;
}

export interface UserAccount {
  id: number;
  currency: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}
