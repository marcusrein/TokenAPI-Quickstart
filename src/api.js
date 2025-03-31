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
 * @returns {Promise<Array<object>>} A promise resolving to the balance data array.
 */
export const fetchBalances = async (walletAddress) => {
  console.log('fetchBalances called with walletAddress:', walletAddress);
  if (!walletAddress || typeof walletAddress !== 'string' || !walletAddress.startsWith('0x')) {
    console.error('Error: Invalid EVM wallet address provided.', walletAddress);
    throw new Error('Invalid EVM wallet address provided. Address must start with 0x.');
  }

  const url = `${BASE_URL}/balances/evm/${walletAddress}`;
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
 * @returns {Promise<Array<object>>} A promise resolving to the metadata array (likely contains one object).
 */
export const fetchTokenMetadata = async (tokenAddress) => {
  console.log('fetchTokenMetadata (Token Info) called with tokenAddress:', tokenAddress);
  if (!tokenAddress || typeof tokenAddress !== 'string' || !tokenAddress.startsWith('0x')) {
    console.error('Error: Invalid EVM token address provided.', tokenAddress);
    throw new Error('Invalid EVM token address provided. Address must start with 0x.');
  }

  // Correct endpoint based on official docs for Token Info (Holders & Supply)
  const url = `${BASE_URL}/tokens/evm/${tokenAddress}`; 
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
 * Corrected based on official docs.
 *
 * @param {string} walletAddress - The EVM wallet address.
 * @returns {Promise<Array<object>>} A promise resolving to the transfers data array.
 */
export const fetchTokenTransfers = async (walletAddress) => {
  console.log('fetchTokenTransfers called with walletAddress:', walletAddress);
   if (!walletAddress || typeof walletAddress !== 'string' || !walletAddress.startsWith('0x')) {
    console.error('Error: Invalid EVM wallet address provided.', walletAddress);
    throw new Error('Invalid EVM wallet address provided. Address must start with 0x.');
  }

  // Correct endpoint based on official docs
  const url = `${BASE_URL}/transfers/evm/${walletAddress}`; 
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${JWT_TOKEN}`,
    },
  };
  return performFetch(url, options, 'Token Transfers');
};

/**
 * Fetches historical OHLC data for a given EVM token address.
 * NOTE: Endpoint '/ohlc/evm/{tokenAddress}' is inferred.
 *
 * @param {string} tokenAddress - The EVM token contract address.
 * @returns {Promise<Array<object>>} A promise resolving to the OHLC data array.
 */
export const fetchTokenOhlc = async (tokenAddress) => {
    console.log('fetchTokenOhlc called with tokenAddress:', tokenAddress);
    if (!tokenAddress || typeof tokenAddress !== 'string' || !tokenAddress.startsWith('0x')) {
        console.error('Error: Invalid EVM token address provided.', tokenAddress);
        throw new Error('Invalid EVM token address provided. Address must start with 0x.');
    }

    // Correct endpoint based on official docs
    const url = `${BASE_URL}/ohlc/prices/evm/${tokenAddress}`; 
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
 * @returns {Promise<Array<object>>} A promise resolving to the holders data array.
 */
export const fetchTokenHolders = async (tokenAddress) => {
    console.log('fetchTokenHolders called with tokenAddress:', tokenAddress);
    if (!tokenAddress || typeof tokenAddress !== 'string' || !tokenAddress.startsWith('0x')) {
        console.error('Error: Invalid EVM token address provided.', tokenAddress);
        throw new Error('Invalid EVM token address provided. Address must start with 0x.');
    }

    // Endpoint from official docs
    const url = `${BASE_URL}/holders/evm/${tokenAddress}`;
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${JWT_TOKEN}`,
        },
    };
    return performFetch(url, options, 'Token Holders');
}; 