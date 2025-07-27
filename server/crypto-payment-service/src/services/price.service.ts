export interface PriceData {
  symbol: string;
  price_usd: number;
  last_updated: string;
}

export class PriceService {
  private static readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  private static readonly COINBASE_API = 'https://api.coinbase.com/v2';

  public static async getETHPriceUSD(): Promise<number> {
    try {
      console.log('Fetching ETH price from CoinGecko...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${this.COINGECKO_API}/simple/price?ids=ethereum&vs_currencies=usd`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'JobberApp/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json() as any;
      
      if (data.ethereum && data.ethereum.usd && typeof data.ethereum.usd === 'number') {
        console.log(`ETH price from CoinGecko: $${data.ethereum.usd}`);
        return data.ethereum.usd;
      }
      
      throw new Error('Invalid price data structure from CoinGecko');
    } catch (error) {
      console.error('Error fetching ETH price from CoinGecko:', error);
      
      // Fallback to Coinbase API
      try {
        console.log('Trying Coinbase API as fallback...');
        const fallbackController = new AbortController();
        const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 10000);
        
        const response = await fetch(`${this.COINBASE_API}/exchange-rates?currency=ETH`, {
          signal: fallbackController.signal,
          headers: {
            'User-Agent': 'JobberApp/1.0'
          }
        });
        
        clearTimeout(fallbackTimeoutId);
        
        if (!response.ok) {
          throw new Error(`Coinbase API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json() as any;
        
        if (data.data && data.data.rates && data.data.rates.USD) {
          const price = parseFloat(data.data.rates.USD);
          console.log(`ETH price from Coinbase: $${price}`);
          return price;
        }
        
        throw new Error('Invalid fallback price data from Coinbase');
      } catch (fallbackError) {
        console.error('Error fetching ETH price from Coinbase:', fallbackError);
        
        // Return estimated price if both APIs fail (for development)
        console.log('Using estimated ETH price: $3500');
        return 3500; // Estimated ETH price
      }
    }
  }

  // Convert USD to ETH amount
  public static async convertUSDToETH(usdAmount: number): Promise<{
    ethAmount: string;
    usdAmount: number;
    ethPriceUSD: number;
    exchangeRate: string;
  }> {
    const ethPriceUSD = await this.getETHPriceUSD();
    const ethAmount = (usdAmount / ethPriceUSD).toFixed(6);
    
    return {
      ethAmount,
      usdAmount,
      ethPriceUSD,
      exchangeRate: `1 ETH = $${ethPriceUSD.toLocaleString()}`
    };
  }

  // Get multiple token prices (for future expansion)
  public static async getTokenPrices(symbols: string[] = ['ethereum']): Promise<Record<string, PriceData>> {
    try {
      const ids = symbols.join(',');
      const response = await fetch(
        `${this.COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_last_updated_at=true`
      );
      const data = await response.json() as any;
      
      const result: Record<string, PriceData> = {};
      
      Object.keys(data as object).forEach(key => {
        if (data[key].usd) {
          result[key] = {
            symbol: key.toUpperCase(),
            price_usd: data[key].usd,
            last_updated: new Date(data[key].last_updated_at * 1000).toISOString()
          };
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching token prices:', error);
      throw error;
    }
  }
} 