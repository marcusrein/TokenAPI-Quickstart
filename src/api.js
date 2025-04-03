const BASE_URL = 'https://token-api.thegraph.com';
const JWT_TOKEN = process.env.REACT_APP_TOKEN_API_JWT;

/**
 * Helper function to perform fetch requests with error handling.
 *
 * @param {string} url - The URL to fetch.
 * @param {object} options - The fetch options.
 * @param {string} context - A string describing the context of the fetch (e.g., 'Balances', 'Metadata').
 * @returns {Promise<object>} A promise that resolves to the API response data.
 * @throws {Error} Throws an error if the JWT token is missing or the fetch fails.
 */
const performFetch = async (url, options, context) => {
  console.log(`[${context}] Performing fetch. URL: ${url}`);
  if (!JWT_TOKEN) {
    console.error(`[${context}] Error: REACT_APP_TOKEN_API_JWT environment variable is not set.`);
    throw new Error('API token is missing. Please set REACT_APP_TOKEN_API_JWT in your .env file.');
  }

  console.log(`[${context}] Using JWT starting with:`, JWT_TOKEN ? `${JWT_TOKEN.substring(0, 10)}...` : 'Not set');

  try {
    const response = await fetch(url, options);
    console.log(`[${context}] API Response Status: ${response.status}`);

    if (!response.ok) {
      let errorBody = 'Could not read error body';
      try {
        errorBody = await response.text();
        console.error(`[${context}] API Error Body:`, errorBody);
        try {
          errorBody = JSON.parse(errorBody);
        } catch (parseError) {
          console.warn(`[${context}] Could not parse error body as JSON.`);
        }
      } catch (readError) {
        console.error(`[${context}] Failed to read error response body:`, readError);
      }
      throw new Error(`[${context}] API request failed with status ${response.status}. Body: ${typeof errorBody === 'string' ? errorBody : JSON.stringify(errorBody)}`);
    }

    const data = await response.json();
    console.log(`[${context}] Successfully fetched data:`, data);
    // The data seems consistently wrapped in a 'data' array from examples
    return data.data || data; // Return the inner array if it exists
  } catch (error) {
    console.error(`[${context}] Fetch error:`, error);
    throw error; // Re-throw for component handling
  }
};

/**
 * Fetches token balances for a given EVM wallet address.
 *
 * @param {string} walletAddress - The EVM wallet address.
 * @param {string} [networkId='mainnet'] - The network ID (mainnet, bsc, base, arbitrum-one, optimism, matic).
 * @returns {Promise<Array<object>>} A promise resolving to the balance data array.
 */
export const fetchBalances = async (walletAddress, networkId = 'mainnet') => {
  console.log('fetchBalances called with walletAddress:', walletAddress, 'networkId:', networkId);
  if (!walletAddress || typeof walletAddress !== 'string' || !walletAddress.startsWith('0x')) {
    console.error('Error: Invalid EVM wallet address provided.', walletAddress);
    throw new Error('Invalid EVM wallet address provided. Address must start with 0x.');
  }

  const url = `${BASE_URL}/balances/evm/${walletAddress}?network_id=${networkId}`;
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${JWT_TOKEN}`,
    },
  };
  return performFetch(url, options, 'Balances');
};

/**
 * Fetches metadata for a given EVM token address.
 * NOTE: Endpoint '/metadata/evm/{tokenAddress}' is inferred.
 *
 * @param {string} tokenAddress - The EVM token contract address.
 * @param {string} [networkId='mainnet'] - The network ID (mainnet, bsc, base, arbitrum-one, optimism, matic).
 * @returns {Promise<Array<object>>} A promise resolving to the metadata array (likely contains one object).
 */
export const fetchTokenMetadata = async (tokenAddress, networkId = 'mainnet') => {
  console.log('fetchTokenMetadata (Token Info) called with tokenAddress:', tokenAddress, 'networkId:', networkId);
  if (!tokenAddress || typeof tokenAddress !== 'string' || !tokenAddress.startsWith('0x')) {
    console.error('Error: Invalid EVM token address provided.', tokenAddress);
    throw new Error('Invalid EVM token address provided. Address must start with 0x.');
  }

  // Correct endpoint based on official docs for Token Info (Holders & Supply)
  const url = `${BASE_URL}/tokens/evm/${tokenAddress}?network_id=${networkId}`; 
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${JWT_TOKEN}`,
    },
  };
  // Note: Context name kept as 'Token Metadata' for consistency in logs, though endpoint is /tokens/
  return performFetch(url, options, 'Token Metadata'); 
};

/**
 * Fetches transfers associated with a given EVM *wallet* address.
 * Supports pagination and filtering as per the official docs.
 *
 * @param {string} walletAddress - The EVM wallet address.
 * @param {string} [networkId='mainnet'] - The network ID (mainnet, bsc, base, arbitrum-one, optimism, matic).
 * @param {number} [page=1] - The page number to fetch (minimum: 1).
 * @param {number} [limit=10] - Maximum number of results per page (1-1000).
 * @param {number} [age] - Data age in days (1-180).
 * @param {string} [contractAddress] - Optional contract address to filter transfers.
 * @returns {Promise<Array<object>>} A promise resolving to the transfers data array.
 */
export const fetchTokenTransfers = async (
  walletAddress,
  networkId = 'mainnet',
  page = 1,
  limit = 10,
  age,
  contractAddress
) => {
  console.log('fetchTokenTransfers called with walletAddress:', walletAddress, 
      'networkId:', networkId, 
      'page:', page, 
      'limit:', limit, 
      'age:', age, 
      'contractAddress:', contractAddress);
      
  if (!walletAddress || typeof walletAddress !== 'string' || !walletAddress.startsWith('0x')) {
    console.error('Error: Invalid EVM wallet address provided.', walletAddress);
    throw new Error('Invalid EVM wallet address provided. Address must start with 0x.');
  }

  // Build URL with query parameters
  let url = `${BASE_URL}/transfers/evm/${walletAddress}?network_id=${networkId}&page=${page}&limit=${limit}`;
  
  // Add optional parameters if provided
  if (age !== undefined) url += `&age=${age}`;
  if (contractAddress) url += `&contract=${contractAddress}`;
  
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${JWT_TOKEN}`,
    },
  };
  
  console.log(`[Token Transfers] Request URL with params: ${url}`);
  return performFetch(url, options, 'Token Transfers');
};

/**
 * Fetches historical OHLC data for a given EVM token address.
 *
 * @param {string} tokenAddress - The EVM token contract address.
 * @param {string} [networkId='mainnet'] - The network ID (mainnet, bsc, base, arbitrum-one, optimism, matic).
 * @returns {Promise<Array<object>>} A promise resolving to the OHLC data array.
 */
export const fetchTokenOhlc = async (tokenAddress, networkId = 'mainnet') => {
    console.log('fetchTokenOhlc called with tokenAddress:', tokenAddress, 'networkId:', networkId);
    if (!tokenAddress || typeof tokenAddress !== 'string' || !tokenAddress.startsWith('0x')) {
        console.error('Error: Invalid EVM token address provided.', tokenAddress);
        throw new Error('Invalid EVM token address provided. Address must start with 0x.');
    }

    // Correct endpoint based on official docs
    const url = `${BASE_URL}/ohlc/prices/evm/${tokenAddress}?network_id=${networkId}`; 
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${JWT_TOKEN}`,
        },
    };
    return performFetch(url, options, 'Token OHLC');
};

/**
 * Fetches holders for a given EVM token contract address.
 * Added based on official docs.
 *
 * @param {string} tokenAddress - The EVM token contract address.
 * @param {string} [networkId='mainnet'] - The network ID (mainnet, bsc, base, arbitrum-one, optimism, matic).
 * @returns {Promise<Array<object>>} A promise resolving to the holders data array.
 */
export const fetchTokenHolders = async (tokenAddress, networkId = 'mainnet') => {
    console.log('fetchTokenHolders called with tokenAddress:', tokenAddress, 'networkId:', networkId);
    if (!tokenAddress || typeof tokenAddress !== 'string' || !tokenAddress.startsWith('0x')) {
        console.error('Error: Invalid EVM token address provided.', tokenAddress);
        throw new Error('Invalid EVM token address provided. Address must start with 0x.');
    }

    // Endpoint from official docs
    const url = `${BASE_URL}/holders/evm/${tokenAddress}?network_id=${networkId}`;
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${JWT_TOKEN}`,
        },
    };
    return performFetch(url, options, 'Token Holders');
}; 