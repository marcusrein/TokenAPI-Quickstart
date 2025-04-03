import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import {
  fetchBalances,
  fetchTokenMetadata,
  fetchTokenTransfers,
  fetchTokenOhlc,
  fetchTokenHolders
} from './api'; // Import API functions
import './App.css'; // Assuming you have some base styles

// Define query types (moved from Dashboard)
const QUERY_TYPES = {
  BALANCES: 'Balances',
  TOKEN_INFO: 'Token Info',
  TRANSFERS: 'Transfers',
  HOLDERS: 'Token Holders',
  OHLC: 'Price History (OHLC)',
};

// Define input type mapping (moved from Dashboard)
const INPUT_TYPE = {
  [QUERY_TYPES.BALANCES]: 'wallet',
  [QUERY_TYPES.TRANSFERS]: 'wallet',
  [QUERY_TYPES.TOKEN_INFO]: 'token',
  [QUERY_TYPES.HOLDERS]: 'token',
  [QUERY_TYPES.OHLC]: 'token',
};

// Define network options
const NETWORK_OPTIONS = [
  { id: 'mainnet', name: 'Ethereum Mainnet' },
  { id: 'bsc', name: 'Binance Smart Chain' },
  { id: 'base', name: 'Base' },
  { id: 'arbitrum-one', name: 'Arbitrum One' },
  { id: 'optimism', name: 'Optimism' },
  { id: 'matic', name: 'Polygon (Matic)' },
];

// Helper function to initialize state for each tab
const initializeTabState = (defaultValue) => {
  return Object.values(QUERY_TYPES).reduce((acc, type) => {
    acc[type] = defaultValue;
    return acc;
  }, {});
};

function App() {
  // State lifted from Dashboard
  const [queryType, setQueryType] = useState(QUERY_TYPES.BALANCES);
  const [walletAddress, setWalletAddress] = useState('0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208');
  const [tokenAddress, setTokenAddress] = useState('0xc944e90c64b2c07662a292be6244bdf05cda44a7');
  
  // State for selected network
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORK_OPTIONS[0].id); // Default to first network
  
  // Pagination state for Transfers
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State per tab
  const [resultsByTab, setResultsByTab] = useState(() => initializeTabState(null));
  const [loadingByTab, setLoadingByTab] = useState(() => initializeTabState(false));
  const [errorByTab, setErrorByTab] = useState(() => initializeTabState(null));

  // Logic derived from state (moved from Dashboard)
  const currentInputMode = INPUT_TYPE[queryType]; // 'wallet' or 'token'
  const isWalletQuery = currentInputMode === 'wallet';
  const currentAddress = isWalletQuery ? walletAddress : tokenAddress;
  const handleAddressChange = (event) => {
    const value = event.target.value;
    if (isWalletQuery) {
      setWalletAddress(value);
    } else {
      setTokenAddress(value);
    }
  };
  const currentInputLabel = isWalletQuery ? 'Wallet Address' : 'Token Address';
  const currentPlaceholder = `Enter ${currentInputLabel} (e.g., 0x...)`;

  // Pagination handlers
  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
    if (queryType === QUERY_TYPES.TRANSFERS) {
      fetchTransfersWithCurrentParams(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      if (queryType === QUERY_TYPES.TRANSFERS) {
        fetchTransfersWithCurrentParams(currentPage - 1);
      }
    }
  };

  // Helper function to fetch transfers with current parameters
  const fetchTransfersWithCurrentParams = (page) => {
    if (currentAddress && currentAddress.startsWith('0x')) {
      setLoadingByTab(prev => ({ ...prev, [QUERY_TYPES.TRANSFERS]: true }));
      setErrorByTab(prev => ({ ...prev, [QUERY_TYPES.TRANSFERS]: null }));
      
      fetchTokenTransfers(currentAddress, selectedNetwork, page, itemsPerPage)
        .then(data => {
          console.log(`App.js: Data received for Transfers page ${page}:`, data);
          const formattedData = Array.isArray(data) ? data : (data ? [data] : null);
          setResultsByTab(prev => ({ ...prev, [QUERY_TYPES.TRANSFERS]: formattedData }));
        })
        .catch(err => {
          console.error(`App.js: Error during Transfers fetch:`, err);
          const errorMessage = err.message || 'An unknown error occurred.';
          setErrorByTab(prev => ({ ...prev, [QUERY_TYPES.TRANSFERS]: errorMessage }));
          setResultsByTab(prev => ({ ...prev, [QUERY_TYPES.TRANSFERS]: null }));
        })
        .finally(() => {
          setLoadingByTab(prev => ({ ...prev, [QUERY_TYPES.TRANSFERS]: false }));
          console.log(`App.js: Finished Transfers fetch attempt.`);
        });
    }
  };

  // Data fetching function (modified to update state per tab)
  const handleFetchClick = async () => {
    const addressToFetch = currentAddress;
    const currentQueryType = queryType; // Capture query type at the time of click

    console.log(`App.js: Fetch button clicked for type: ${currentQueryType}, mode: ${currentInputMode}, address: ${addressToFetch}, network: ${selectedNetwork}`);
    
    // Update loading and error state for the specific tab
    setLoadingByTab(prev => ({ ...prev, [currentQueryType]: true }));
    setErrorByTab(prev => ({ ...prev, [currentQueryType]: null }));
    // Optionally clear previous results for this tab before fetching new ones
    // setResultsByTab(prev => ({ ...prev, [currentQueryType]: null })); 

    try {
      let data;
      switch (currentQueryType) {
        case QUERY_TYPES.BALANCES:
          data = await fetchBalances(addressToFetch, selectedNetwork);
          break;
        case QUERY_TYPES.TOKEN_INFO:
          data = await fetchTokenMetadata(addressToFetch, selectedNetwork);
          break;
        case QUERY_TYPES.TRANSFERS:
          // Reset to page 1 when doing a new search
          setCurrentPage(1);
          data = await fetchTokenTransfers(addressToFetch, selectedNetwork, 1, itemsPerPage);
          break;
        case QUERY_TYPES.HOLDERS:
          data = await fetchTokenHolders(addressToFetch, selectedNetwork);
          break;
        case QUERY_TYPES.OHLC:
          data = await fetchTokenOhlc(addressToFetch, selectedNetwork);
          break;
        default:
          throw new Error('Invalid query type');
      }

      console.log(`App.js: Data received for ${currentQueryType}:`, data);
      const formattedData = Array.isArray(data) ? data : (data ? [data] : null);
      setResultsByTab(prev => ({ ...prev, [currentQueryType]: formattedData }));

    } catch (err) {
      console.error(`App.js: Error during ${currentQueryType} fetch:`, err);
      const errorMessage = err.message || 'An unknown error occurred.';
      setErrorByTab(prev => ({ ...prev, [currentQueryType]: errorMessage }));
      setResultsByTab(prev => ({ ...prev, [currentQueryType]: null })); // Clear results on error for this tab
    } finally {
      setLoadingByTab(prev => ({ ...prev, [currentQueryType]: false }));
      console.log(`App.js: Finished fetch attempt for ${currentQueryType}.`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Token API Dashboard</h1>
      </header>
      <main>
        <div className="network-selector">
          <label htmlFor="network-select">Network:</label>
          <select
            id="network-select"
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
          >
            {NETWORK_OPTIONS.map((network) => (
              <option key={network.id} value={network.id}>
                {network.name}
              </option>
            ))}
          </select>
        </div>
        <Dashboard
          // Pass state for the *current* tab down
          queryType={queryType}
          results={resultsByTab[queryType]}
          loading={loadingByTab[queryType]}
          error={errorByTab[queryType]}
          currentAddress={currentAddress}
          currentInputLabel={currentInputLabel}
          currentPlaceholder={currentPlaceholder}

          // Pass handlers down
          setQueryType={setQueryType} // Handler to change the *active* tab
          handleAddressChange={handleAddressChange}
          handleFetchClick={handleFetchClick} // Handler to fetch data for the *active* tab

          // Pass constants needed by Dashboard
          QUERY_TYPES={QUERY_TYPES}
        />
        
        {queryType === QUERY_TYPES.TRANSFERS && resultsByTab[QUERY_TYPES.TRANSFERS] && (
          <div className="pagination-controls">
            <button 
              onClick={handlePreviousPage} 
              disabled={currentPage <= 1 || loadingByTab[QUERY_TYPES.TRANSFERS]}
            >
              Previous
            </button>
            <span className="page-indicator">Page {currentPage}</span>
            <button 
              onClick={handleNextPage}
              disabled={loadingByTab[QUERY_TYPES.TRANSFERS] || (resultsByTab[QUERY_TYPES.TRANSFERS] && resultsByTab[QUERY_TYPES.TRANSFERS].length < itemsPerPage)}
            >
              Next
            </button>
          </div>
        )}
      </main>
      <footer className="App-footer">
        <p>
          Powered by{' '}
          <a
            href="https://thegraph.com/docs/en/token-api/quick-start/"
            target="_blank"
            rel="noopener noreferrer"
          >
            The Graph Token API
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App; 