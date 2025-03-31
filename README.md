# TokenAPI Quickstart Project

This repository contains examples of how to interact with The Graph's Token API.

## 1. Direct API Usage (React Example)

This project (`TokenAPI-Quickstart`) demonstrates how to interact with The Graph's Token API directly from a web application (React). It fetches data using standard HTTP requests to the API endpoints.

**Setup & Running:**

1.  Navigate to this directory: `cd TokenAPI-Quickstart`
2.  Copy the `.env.example` file to `.env`: `cp .env.example .env`
3.  Replace the placeholder values in `.env` with your actual JWT token and API Key from [The Graph Market](https://thegraph.com/market/).
4.  Install dependencies: `npm install`
5.  Start the development server: `npm start`

**Functionality:**

This application showcases fetching token balances for a given wallet address using direct calls to the Token API.

## 2. Using the Token API via Cursor's MCP Integration

Beyond direct API calls in an application, you can integrate the Token API directly into your Cursor IDE using the Multi-purpose Coprocessor (MCP) feature. This allows you to query real-time, structured blockchain data using SQL-like commands directly within your development environment via the Cursor chat/AI.

**What is the Token API?**

The Graph's Token API provides access to indexed and structured data from various EVM-compatible blockchains (like Ethereum, Polygon, BSC, etc.). It allows you to query information like token details, transfers, balances, swaps, and more using a SQL interface, simplifying blockchain data analysis.

**Configuring Cursor MCP for Token API:**

Follow these steps to configure Cursor:

1.  **Prerequisites:**
    *   Ensure Cursor is installed.
    *   Obtain a JWT token from [The Graph Market](https://thegraph.com/market/).
    *   Ensure `npx` (or `bunx`) is installed (Node.js v18+ required) and in your PATH.

2.  **Configure Cursor:**
    *   Open Cursor Settings (`Cmd + ,` or `Ctrl + ,`).
    *   Go to the `MCP` section.
    *   Click "Add new global MCP Server".
    *   Alternatively, edit `~/.cursor/mcp.json`.

3.  **Add Server Details:**
    Use the following configuration, replacing `<YOUR_JWT_TOKEN>` with your actual token:

    ```json
    {
      "mcpServers": {
        "mcp-pinax": {
          "command": "npx",
          "args": [
            "@pinax/mcp",
            "--sse-url",
            "https://token-api.thegraph.com/sse"
            // Optionally add: "--verbose", "true" for debugging logs
          ],
          "env": {
            "ACCESS_TOKEN": "<YOUR_JWT_TOKEN>"
          }
        }
      }
    }
    ```

4.  **Save and Verify:** Save the configuration. Cursor should now attempt to connect to the Token API stream. Check Cursor's logs or status indicators for confirmation or troubleshooting.

**Interacting with the Token API via Cursor Chat:**

Once configured, you can ask Cursor's AI to query the Token API. The AI will use the integrated Pinax tools (`mcp_mcp_pinax_*`) to interact with the API.

**Systematic Exploration:**

You can explore the available data by asking questions like:

1.  `"List the available databases"` - Shows the networks you can query (e.g., `mainnet:evm-tokens@v1.9.0:db_out`, `matic:evm-tokens@v1.9.0:db_out`).
2.  `"List the tables in the mainnet:evm-tokens@v1.9.0:db_out database"` - Shows data categories (e.g., `contracts`, `transfers`, `balances`).
3.  `"Describe the schema of the transfers table in the mainnet:evm-tokens@v1.9.0:db_out database"` - Shows the columns and data types within a table.

**Demo Queries (Examples):**

Ask Cursor questions like these:

*   `"What is the contract address for the 'Uniswap' token (UNI) on Ethereum mainnet?"` (Queries the `contracts` table)
*   `"Show the 5 most recent transfers for the DAI token (contract address 0x6B175474E89094C44Da98b954EedeAC495271d0F) on Ethereum mainnet."` (Queries the `transfers` table)
*   `"What are the token balances for wallet address 0x... [provide address] ... on Polygon?"` (Queries the `balances` table on the `matic` database)
*   `"Find the 3 largest WETH (0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2) transfers on Ethereum mainnet in the last 24 hours."` (Queries the `transfers` table with time and ordering)

This MCP integration provides powerful data access directly within your IDE, complementing the direct API usage demonstrated in the React application. 