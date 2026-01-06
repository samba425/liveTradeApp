export interface OptionData {
  strikePrice: number;
  expiryDate: string;
  
  // Call Option Data
  callOI?: number;
  callChangeInOI?: number;
  callVolume?: number;
  callIV?: number;
  callLTP?: number;
  callChange?: number;
  callBidQty?: number;
  callBidPrice?: number;
  callAskPrice?: number;
  callAskQty?: number;
  
  // Put Option Data
  putOI?: number;
  putChangeInOI?: number;
  putVolume?: number;
  putIV?: number;
  putLTP?: number;
  putChange?: number;
  putBidQty?: number;
  putBidPrice?: number;
  putAskPrice?: number;
  putAskQty?: number;
  
  // Additional Fields
  pcr?: number; // Put-Call Ratio
}

export interface OptionChainData {
  symbol: string;
  expiryDates: string[];
  currentExpiry: string;
  underlyingValue: number;
  underlyingChange: number;
  timestamp: Date;
  options: OptionData[];
  
  // Summary
  totalCallOI?: number;
  totalPutOI?: number;
  pcrByOI?: number;
  pcrByVolume?: number;
  maxPain?: number;
}
