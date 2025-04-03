import React from 'react';
import PropTypes from 'prop-types';
import {
  fetchBalances,
  fetchTokenMetadata,
  fetchTokenTransfers,
  fetchTokenOhlc,
  fetchTokenHolders
} from './api';
import BalanceChart from './BalanceChart';

// Define query types
const QUERY_TYPES = {
  BALANCES: 'Balances',
  TOKEN_INFO: 'Token Info',
  TRANSFERS: 'Transfers',
  HOLDERS: 'Token Holders',
  OHLC: 'Price History (OHLC)',
};

// Define which query types expect a Wallet address vs a Token address
const INPUT_TYPE = {
  [QUERY_TYPES.BALANCES]: 'wallet',
  [QUERY_TYPES.TRANSFERS]: 'wallet',
  [QUERY_TYPES.TOKEN_INFO]: 'token',
  [QUERY_TYPES.HOLDERS]: 'token',
  [QUERY_TYPES.OHLC]: 'token',
};

// Dashboard is now a presentational component receiving props
function Dashboard({
  queryType,
  results,
  loading,
  error,
  currentAddress,
  currentInputLabel,
  currentPlaceholder,
  setQueryType,
  handleAddressChange,
  handleFetchClick,
  QUERY_TYPES, // Receive constants via props
}) {

  // Determine the appropriate input value, label, and handler based on query type
  const currentInputMode = INPUT_TYPE[queryType]; // 'wallet' or 'token'
  const isWalletQuery = currentInputMode === 'wallet';

  // Helper function to render results based on query type (uses props)
  const renderResults = () => {
    if (!results) return null;

    if (results.length === 0) {
        return <p>No results found for this query.</p>;
    }

    switch (queryType) {
      case QUERY_TYPES.BALANCES:
        return (
          <>
            <BalanceChart balances={results} />
            <h3>Token Balances</h3>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Price (USD)</th>
                  <th>Value (USD)</th>
                  <th>Contract</th>
                </tr>
              </thead>
              <tbody>
                {results.map((token, index) => (
                  <tr key={token.contract || index}>
                    <td>{token.symbol || 'N/A'}</td>
                    <td>{token.name || 'N/A'}</td>
                    <td>{token.amountFormatted || token.amount || 'N/A'}</td>
                    <td>{token.price_usd ? `$${Number(token.price_usd).toFixed(4)}` : 'N/A'}</td>
                    <td>{token.value_usd ? `$${Number(token.value_usd).toFixed(2)}` : 'N/A'}</td>
                    <td>{token.contract}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );

      case QUERY_TYPES.TOKEN_INFO:
        const tokenInfo = results[0];
        if (!tokenInfo) return <p>No token info found.</p>;
        return (
          <div className="metadata-display">
            <h3>Token Info: {tokenInfo.name} ({tokenInfo.symbol})</h3>
            <ul>
                <li><strong>Name:</strong> {tokenInfo.name || 'N/A'}</li>
                <li><strong>Symbol:</strong> {tokenInfo.symbol || 'N/A'}</li>
                <li><strong>Decimals:</strong> {tokenInfo.decimals ?? 'N/A'}</li>
                <li><strong>Contract Address:</strong> {tokenInfo.address || 'N/A'}</li>
                <li><strong>Network:</strong> {tokenInfo.network_id || 'N/A'}</li>
                <li><strong>Holders:</strong> {tokenInfo.holders ? tokenInfo.holders.toLocaleString() : 'N/A'}</li>
                <li><strong>Price (USD):</strong> {tokenInfo.price_usd ? `$${Number(tokenInfo.price_usd).toFixed(4)}` : 'N/A'}</li>
                <li><strong>Market Cap (USD):</strong> {tokenInfo.market_cap ? `$${Number(tokenInfo.market_cap).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'}</li>
                <li><strong>Circulating Supply:</strong> {tokenInfo.circulating_supply || 'N/A'}</li>
            </ul>
          </div>
        );

      case QUERY_TYPES.TRANSFERS:
        return (
          <>
            {/* Display wallet address if applicable */}
            <h3>Token Transfers {currentInputLabel === 'Wallet Address' ? `(Wallet: ${currentAddress})` : '(Token)'}</h3>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Value (USD)</th>
                  <th>Tx ID</th>
                </tr>
              </thead>
              <tbody>
                {results.map((tx, index) => (
                  <tr key={tx.transaction_id || index}>
                    <td>{tx.datetime || 'N/A'}</td>
                    <td>{tx.from}</td>
                    <td>{tx.to}</td>
                    <td>{tx.amountFormatted || tx.amount || 'N/A'}</td>
                    <td>{tx.value_usd ? `$${Number(tx.value_usd).toFixed(2)}` : 'N/A'}</td>
                    <td>{tx.transaction_id ? `${tx.transaction_id.substring(0, 6)}...${tx.transaction_id.substring(tx.transaction_id.length - 4)}` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );

        case QUERY_TYPES.HOLDERS:
            return (
                <>
                  <h3>Token Holders</h3>
                  <table className="results-table holders-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Holder Address</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((holder, index) => (
                        <tr key={holder.address || index}>
                          <td>{index + 1}</td>
                          <td>{holder.address}</td>
                          <td>{holder.amountFormatted || holder.amount || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              );

        case QUERY_TYPES.OHLC:
            return (
                <>
                  <h3>Price History (OHLC)</h3>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Date/Time</th>
                        <th>Ticker</th>
                        <th>Open</th>
                        <th>High</th>
                        <th>Low</th>
                        <th>Close</th>
                        <th>Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((ohlc, index) => (
                        <tr key={ohlc.datetime || index}>
                          <td>{ohlc.datetime || 'N/A'}</td>
                          <td>{ohlc.ticker || 'N/A'}</td>
                          <td>{ohlc.open ? Number(ohlc.open).toFixed(4) : 'N/A'}</td>
                          <td>{ohlc.high ? Number(ohlc.high).toFixed(4) : 'N/A'}</td>
                          <td>{ohlc.low ? Number(ohlc.low).toFixed(4) : 'N/A'}</td>
                          <td>{ohlc.close ? Number(ohlc.close).toFixed(4) : 'N/A'}</td>
                          <td>{ohlc.volume ? ohlc.volume.toLocaleString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              );

      default:
        return <p>Select a query type to display results.</p>;
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <span className="loading-spinner"></span>
  );

  return (
    <div className="dashboard">
      <div className="query-selector">
        {Object.values(QUERY_TYPES).map((type) => (
          <button
            key={type}
            className={`query-type-btn ${queryType === type ? 'active' : ''}`}
            onClick={() => setQueryType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="input-section">
        <label htmlFor="addressInput">
          {currentInputLabel}:
        </label>
        <input
          type="text"
          id="addressInput"
          value={currentAddress}
          onChange={handleAddressChange}
          placeholder={currentPlaceholder}
        />
        <button onClick={handleFetchClick} disabled={loading || !currentAddress} className="fetch-button">
          {loading ? (
            <span className="loading-text">
              Fetching <LoadingSpinner />
            </span>
          ) : (
            `Fetch ${queryType}`
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {results && (
        <div className="results-section">
          {renderResults()}
        </div>
      )}
    </div>
  );
}

// Add PropTypes for type checking
Dashboard.propTypes = {
  queryType: PropTypes.string.isRequired,
  results: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  currentAddress: PropTypes.string.isRequired,
  currentInputLabel: PropTypes.string.isRequired,
  currentPlaceholder: PropTypes.string.isRequired,
  setQueryType: PropTypes.func.isRequired,
  handleAddressChange: PropTypes.func.isRequired,
  handleFetchClick: PropTypes.func.isRequired,
  QUERY_TYPES: PropTypes.object.isRequired,
};

// Add defaultProps for optional props
Dashboard.defaultProps = {
  results: null,
  error: null,
};

export default Dashboard; 