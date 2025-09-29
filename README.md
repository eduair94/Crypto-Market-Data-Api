# ��� Crypto Market Data API

A simple and fast **NestJS API** for retrieving real-time cryptocurrency market data from 100+ exchanges using the **CCXT library**.

## ✨ Features

- **100+ Exchanges**: Access data from Binance, Coinbase, Kraken, KuCoin, and many more
- **Real-time Data**: Live ticker prices, order books, and recent trades
- **Simple REST API**: Clean and intuitive endpoints
- **Fast Responses**: Built-in caching for optimal performance
- **Auto Documentation**: Swagger/OpenAPI docs included
- **No Authentication Required**: Public market data only

## ��� Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm run build && npm start

# The API will be running at:
# ��� http://localhost:3000
# ��� Docs: http://localhost:3000/docs
```

## ��� API Endpoints

### Get Available Exchanges
```
GET /api/exchanges
```
Returns list of all supported exchanges.

### Get Markets for an Exchange
```
GET /api/exchanges/{exchange}/markets
```
Example: `GET /api/exchanges/binance/markets`

### Get Ticker Price
```
GET /api/exchanges/{exchange}/ticker/{symbol}
```
Example: `GET /api/exchanges/binance/ticker/BTC/USDT`

### Get Order Book
```
GET /api/exchanges/{exchange}/orderbook/{symbol}?limit=20
```
Example: `GET /api/exchanges/binance/orderbook/BTC/USDT?limit=10`

### Get Recent Trades
```
GET /api/exchanges/{exchange}/trades/{symbol}?limit=50
```
Example: `GET /api/exchanges/binance/trades/BTC/USDT?limit=20`

## ��� Usage Examples

### Get Bitcoin Price from Binance
```bash
curl "http://localhost:3000/api/exchanges/binance/ticker/BTC/USDT"
```

Response:
```json
{
  "exchange": "binance",
  "symbol": "BTC/USDT",
  "last": 43250.5,
  "bid": 43249.8,
  "ask": 43251.2,
  "high": 43890.0,
  "low": 42180.5,
  "change": 1070.5,
  "percentage": 2.54,
  "volume": 15420.85
}
```

### Get Ethereum Order Book from Coinbase
```bash
curl "http://localhost:3000/api/exchanges/coinbase/orderbook/ETH/USD?limit=5"
```

### Compare Prices Across Exchanges
```bash
# Bitcoin on different exchanges
curl "http://localhost:3000/api/exchanges/binance/ticker/BTC/USDT"
curl "http://localhost:3000/api/exchanges/kraken/ticker/BTC/USDT"
curl "http://localhost:3000/api/exchanges/coinbase/ticker/BTC/USD"
```

## ��� Configuration

The API runs on port 3000 by default. You can change it:

```bash
PORT=8080 npm start
```

## ��� Supported Exchanges

Popular exchanges include:
- **binance** - Binance
- **coinbase** - Coinbase Pro
- **kraken** - Kraken
- **kucoin** - KuCoin
- **okx** - OKX
- **bybit** - Bybit
- **huobi** - Huobi
- **bitfinex** - Bitfinex
- **gate** - Gate.io
- And 90+ more...

## ��� API Documentation

Visit `http://localhost:3000/docs` for interactive Swagger documentation with:
- All endpoints and parameters
- Live testing interface
- Response examples
- Error codes

## ��� Use Cases

Perfect for:
- **Price Tracking**: Monitor cryptocurrency prices in real-time
- **Arbitrage Detection**: Compare prices across exchanges
- **Portfolio Apps**: Get current market values
- **Trading Bots**: Access market data for algorithmic trading
- **Market Analysis**: Historical and real-time market data
- **Dashboard Creation**: Build crypto market dashboards

## ���️ Development

```bash
# Development mode with hot reload
npm run start:dev

# Build for production
npm run build
npm run start:prod

# Run tests
npm test
```

## ��� License

MIT License - feel free to use in your projects!

---

**��� Built with NestJS + CCXT - Simple, Fast, Reliable**
