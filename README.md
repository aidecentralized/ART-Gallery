# ART-Gallery

Registry for ARTs (Agents, Resources, and Tools)

# MCP Nexus SDK Implementation Examples

This document provides implementation examples in multiple languages to help developers get started integrating with MCP Nexus.

## JavaScript/TypeScript SDK

### Installation

```bash
npm install @mcp-nexus/sdk
# or
yarn add @mcp-nexus/sdk
```

### Registering a Server

```typescript
import { McpNexusClient } from "@mcp-nexus/sdk";

async function registerServer() {
  // Initialize the client with your API key
  const client = new McpNexusClient({
    apiKey: "your_api_key_here",
    environment: "production", // or 'staging' for testing
  });

  try {
    // Register your MCP server
    const server = await client.servers.create({
      name: "CodeAssistant Pro",
      slug: "code-assistant-pro",
      description:
        "AI-powered code assistant with advanced language understanding",
      provider: "DevTech Solutions",
      url: "https://api.devtech.io/mcp/code-assistant",
      documentation_url: "https://docs.devtech.io/code-assistant",
      types: ["agent"],
      tags: ["coding", "development", "ai-assistant"],
      capabilities: [
        {
          name: "generateCode",
          description: "Generate code based on natural language description",
          type: "agent",
          parameters: [
            {
              name: "language",
              description: "Programming language to generate code in",
              type: "string",
              required: true,
            },
            {
              name: "description",
              description:
                "Natural language description of the code to generate",
              type: "string",
              required: true,
            },
            {
              name: "includeTests",
              description: "Whether to include unit tests",
              type: "boolean",
              required: false,
              default: false,
            },
          ],
          examples: [
            "Generate a function to calculate Fibonacci numbers in Python",
            "Create a React component for a form with validation",
          ],
        },
        {
          name: "debugCode",
          description: "Debug code and provide solutions",
          type: "agent",
          parameters: [
            {
              name: "code",
              description: "Code to debug",
              type: "string",
              required: true,
            },
            {
              name: "language",
              description: "Programming language of the code",
              type: "string",
              required: true,
            },
            {
              name: "error",
              description: "Error message or description",
              type: "string",
              required: false,
            },
          ],
        },
      ],
      usage_requirements: {
        authentication_required: true,
        authentication_type: "api_key",
        rate_limits: "1000 requests per hour",
        pricing: "Free tier available, $29/month for Pro",
      },
      contact_email: "api@devtech.io",
    });

    console.log("Server registered successfully!");
    console.log("Server ID:", server.id);
  } catch (error) {
    console.error("Failed to register server:", error);
  }
}

registerServer();
```

### Searching for Servers

```typescript
import { McpNexusClient } from "@mcp-nexus/sdk";

async function searchServers() {
  const client = new McpNexusClient({
    apiKey: "your_api_key_here",
  });

  try {
    // Search for servers matching specific criteria
    const results = await client.discovery.search({
      query: "data analysis visualization",
      type: "agent", // optional filter by type
      tags: ["python", "statistics"], // optional filter by tags
      verified: true, // optional filter for verified servers only
      page: 1,
      limit: 10,
    });

    console.log(`Found ${results.pagination.total} matching servers`);

    // Display results
    results.data.forEach((server) => {
      console.log(`
Name: ${server.name}
Provider: ${server.provider}
Description: ${server.description}
Types: ${server.types.join(", ")}
Rating: ${server.rating}
Uptime: ${server.uptime}%
Tags: ${server.tags.join(", ")}
Verified: ${server.verified ? "Yes" : "No"}
URL: ${server.url}
      `);
    });

    // Get detailed info for a specific server
    if (results.data.length > 0) {
      const serverId = results.data[0].id;
      const serverDetails = await client.servers.get(serverId);

      console.log("Server Capabilities:");
      serverDetails.capabilities.forEach((capability) => {
        console.log(`- ${capability.name}: ${capability.description}`);
      });
    }
  } catch (error) {
    console.error("Search failed:", error);
  }
}

searchServers();
```

### Connecting to an MCP Server

```typescript
import { McpNexusClient } from "@mcp-nexus/sdk";
import { McpClient } from "@mcp/client";

async function connectToServer() {
  const nexusClient = new McpNexusClient({
    apiKey: "your_api_key_here",
  });

  try {
    // Find a server for data analysis
    const searchResults = await nexusClient.discovery.search({
      query: "data analysis",
      type: "agent",
      verified: true,
      limit: 1,
    });

    if (searchResults.data.length === 0) {
      console.log("No matching servers found");
      return;
    }

    const server = searchResults.data[0];
    console.log(`Found server: ${server.name} by ${server.provider}`);

    // Option 1: Use the convenience method to get a configured MCP client
    const mcpClient = await nexusClient.connectToServer(server.id, {
      apiKey: "your_server_specific_api_key", // if the server requires authentication
    });

    // Option 2: Create your own MCP client instance
    const customMcpClient = new McpClient({
      serverUrl: server.url,
      apiKey: "your_server_specific_api_key",
    });

    // Use the MCP client to interact with the server
    const result = await mcpClient.invokeCapability("analyzeDataset", {
      dataset: "https://example.com/sales_data.csv",
      analysisType: "detailed",
    });

    console.log("Analysis result:", result);
  } catch (error) {
    console.error("Failed to connect to server:", error);
  }
}

connectToServer();
```

## Python SDK

### Installation

```bash
pip install mcp-nexus-sdk
```

### Registering a Server

```python
from mcp_nexus import McpNexusClient

def register_server():
    # Initialize client
    client = McpNexusClient(api_key="your_api_key_here")

    # Register server
    try:
        server = client.servers.create(
            name="ImageAnalysis API",
            slug="image-analysis-api",
            description="Advanced computer vision API for image analysis and object detection",
            provider="VisionTech Inc.",
            url="https://api.visiontech.ai/mcp/image-analysis",
            documentation_url="https://docs.visiontech.ai/image-analysis",
            types=["tool"],
            tags=["computer-vision", "image-processing", "object-detection"],
            capabilities=[
                {
                    "name": "detectObjects",
                    "description": "Detect and classify objects in images",
                    "type": "tool",
                    "parameters": [
                        {
                            "name": "image",
                            "description": "Image URL or base64-encoded image data",
                            "type": "string",
                            "required": True
                        },
                        {
                            "name": "min_confidence",
                            "description": "Minimum confidence threshold (0-1)",
                            "type": "number",
                            "required": False,
                            "default": 0.5
                        },
                        {
                            "name": "max_results",
                            "description": "Maximum number of results to return",
                            "type": "integer",
                            "required": False,
                            "default": 10
                        }
                    ]
                },
                {
                    "name": "analyzeScene",
                    "description": "Analyze and describe image scenes",
                    "type": "tool",
                    "parameters": [
                        {
                            "name": "image",
                            "description": "Image URL or base64-encoded image data",
                            "type": "string",
                            "required": True
                        },
                        {
                            "name": "detail_level",
                            "description": "Level of detail in analysis (basic, standard, detailed)",
                            "type": "string",
                            "required": False,
                            "default": "standard"
                        }
                    ]
                }
            ],
            usage_requirements={
                "authentication_required": True,
                "authentication_type": "api_key",
                "rate_limits": "100 requests per minute",
                "pricing": "Free tier: 1000 requests/month, Pro: $49/month"
            },
            contact_email="api@visiontech.ai"
        )

        print(f"Server registered successfully with ID: {server.id}")

    except Exception as e:
        print(f"Registration failed: {str(e)}")

if __name__ == "__main__":
    register_server()
```

### Searching and Using Servers

```python
from mcp_nexus import McpNexusClient
from mcp import McpClient
import pandas as pd
import json

def search_and_use_servers():
    # Initialize client
    client = McpNexusClient(api_key="your_api_key_here")

    try:
        # Search for data visualization tools
        search_results = client.discovery.search(
            query="data visualization charts",
            type="tool",
            tags=["data-viz"],
            verified=True,
            limit=5
        )

        print(f"Found {len(search_results.data)} matching servers:")

        for server in search_results.data:
            print(f"- {server.name} by {server.provider}")
            print(f"  Rating: {server.rating}, Uptime: {server.uptime}%")
            print(f"  URL: {server.url}")
            print(f"  Description: {server.description[:100]}...")
            print()

        if not search_results.data:
            return

        # Select the first result
        selected_server = search_results.data[0]

        # Get detailed information
        server_details = client.servers.get(selected_server.id)

        print(f"Selected server: {server_details.name}")
        print("Capabilities:")
        for capability in server_details.capabilities:
            print(f"- {capability['name']}: {capability['description']}")

        # Connect to the server
        mcp_client = client.connect_to_server(
            server_id=selected_server.id,
            api_key="your_server_specific_api_key"  # if required
        )

        # Example: Generate a visualization
        sales_data = pd.read_csv("sales_data.csv")
        data_json = json.loads(sales_data.to_json(orient="records"))

        visualization = mcp_client.invoke_capability(
            "generateVisualization",
            parameters={
                "data": data_json,
                "chartType": "bar",
                "title": "Monthly Sales by Region",
                "dimensions": {
                    "width": 800,
                    "height": 500
                }
            }
        )

        # Save the visualization
        with open("sales_visualization.svg", "w") as f:
            f.write(visualization["svg"])

        print("Visualization generated and saved to sales_visualization.svg")

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    search_and_use_servers()
```

## Go SDK

### Installation

```bash
go get github.com/mcp-nexus/sdk-go
```

### Registering a Server

```go
package main

import (
	"context"
	"fmt"
	"log"

	nexus "github.com/mcp-nexus/sdk-go"
)

func main() {
	// Initialize client
	client, err := nexus.NewClient(nexus.ClientOptions{
		APIKey: "your_api_key_here",
	})
	if err != nil {
		log.Fatalf("Failed to initialize client: %v", err)
	}

	// Define server capabilities
	generateTextCapability := nexus.ServerCapability{
		Name:        "generateText",
		Description: "Generate creative text based on prompts",
		Type:        "agent",
		Parameters: []nexus.CapabilityParameter{
			{
				Name:        "prompt",
				Description: "Text prompt for generation",
				Type:        "string",
				Required:    true,
			},
			{
				Name:        "maxLength",
				Description: "Maximum length of generated text",
				Type:        "integer",
				Required:    false,
				Default:     "1000",
			},
			{
				Name:        "temperature",
				Description: "Creativity level (0-1)",
				Type:        "number",
				Required:    false,
				Default:     "0.7",
			},
		},
	}

	// Register server
	serverParams := nexus.ServerRegistration{
		Name:        "CreativeWriter AI",
		Slug:        "creative-writer-ai",
		Description: "AI agent for generating creative writing and content",
		Provider:    "WordCraft Labs",
		URL:         "https://api.wordcraft.io/mcp/creative-writer",
		Types:       []string{"agent"},
		Tags:        []string{"writing", "content-generation", "creative"},
		Capabilities: []nexus.ServerCapability{
			generateTextCapability,
		},
		UsageRequirements: nexus.UsageRequirements{
			AuthenticationRequired: true,
			AuthenticationType:     "api_key",
			RateLimits:             "500 requests per day",
			Pricing:                "Free tier with limited features, $19/month for premium",
		},
		ContactEmail: "api@wordcraft.io",
	}

	ctx := context.Background()
	server, err := client.Servers.Create(ctx, serverParams)
	if err != nil {
		log.Fatalf("Failed to register server: %v", err)
	}

	fmt.Printf("Server registered successfully with ID: %s\n", server.ID)
}
```

### Searching for Servers

```go
package main

import (
	"context"
	"fmt"
	"log"

	nexus "github.com/mcp-nexus/sdk-go"
)

func main() {
	// Initialize client
	client, err := nexus.NewClient(nexus.ClientOptions{
		APIKey: "your_api_key_here",
	})
	if err != nil {
		log.Fatalf("Failed to initialize client: %v", err)
	}

	ctx := context.Background()

	// Search for servers
	searchParams := nexus.SearchParams{
		Query:    "language translation",
		Type:     "agent",
		Tags:     []string{"nlp"},
		Verified: true,
		Page:     1,
		Limit:    10,
	}

	results, err := client.Discovery.Search(ctx, searchParams)
	if err != nil {
		log.Fatalf("Search failed: %v", err)
	}

	fmt.Printf("Found %d matching servers\n", results.Pagination.Total)

	for _, server := range results.Data {
		fmt.Printf("\nName: %s\n", server.Name)
		fmt.Printf("Provider: %s\n", server.Provider)
		fmt.Printf("Description: %s\n", server.Description)
		fmt.Printf("Types: %s\n", server.Types)
		fmt.Printf("Rating: %.1f\n", server.Rating)
		fmt.Printf("URL: %s\n", server.URL)
		fmt.Printf("Verified: %v\n", server.Verified)
	}

	// Get details of first result
	if len(results.Data) > 0 {
		serverID := results.Data[0].ID
		serverDetails, err := client.Servers.Get(ctx, serverID)
		if err != nil {
			log.Fatalf("Failed to get server details: %v", err)
		}

		fmt.Printf("\nDetailed information for %s:\n", serverDetails.Name)
		fmt.Printf("Capabilities:\n")
		for _, capability := range serverDetails.Capabilities {
			fmt.Printf("- %s: %s\n", capability.Name, capability.Description)
		}
	}
}
```

## Rust SDK

### Installation

Add to your Cargo.toml:

```toml
[dependencies]
mcp-nexus-sdk = "1.0.0"
tokio = { version = "1", features = ["full"] }
```

### Using the SDK

```rust
use mcp_nexus_sdk::{Client, ClientOptions, servers::ServerRegistration, discovery::SearchParams};
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Initialize client
    let client = Client::new(ClientOptions {
        api_key: "your_api_key_here".to_string(),
        ..Default::default()
    })?;

    // Search for servers
    let search_params = SearchParams {
        query: Some("financial analysis".to_string()),
        type_: Some("agent".to_string()),
        tags: Some(vec!["finance".to_string(), "investment".to_string()]),
        verified: Some(true),
        page: Some(1),
        limit: Some(5),
    };

    let results = client.discovery.search(search_params).await?;

    println!("Found {} matching servers:", results.pagination.total);

    for server in &results.data {
        println!("- {} by {}", server.name, server.provider);
        println!("  Rating: {}, Uptime: {}%", server.rating, server.uptime);
        println!("  URL: {}", server.url);
        println!();
    }

    // Get detailed information about a server
    if !results.data.is_empty() {
        let server_id = &results.data[0].id;
        let server_details = client.servers.get(server_id).await?;

        println!("Server Details for {}:", server_details.name);
        println!("Description: {}", server_details.description);
        println!("Capabilities:");

        for capability in &server_details.capabilities {
            println!("- {}: {}", capability.name, capability.description);
        }
    }

    Ok(())
}
```

## Implementation Best Practices

### Server Registration

1. **Detailed Metadata**: Provide comprehensive information about your server's capabilities, including detailed parameter descriptions.

2. **Accurate Tags**: Use specific tags that accurately describe your server's functionality to make it easier to discover.

3. **Comprehensive Documentation**: Include links to detailed documentation for complex capabilities.

4. **Clear Usage Requirements**: Clearly specify authentication methods, rate limits, and pricing information.

### Server Discovery

1. **Targeted Searches**: Use specific search queries and filters to find the most relevant servers.

2. **Verification Checks**: Prioritize verified servers for production applications.

3. **Performance Consideration**: Check server uptime and reliability metrics before integration.

4. **Capability Exploration**: Examine all available capabilities to fully utilize selected servers.

### Security Considerations

1. **API Key Management**: Store API keys securely using environment variables or a secrets manager.

2. **Validate Server Identity**: Use the verification system to ensure server authenticity.

3. **Rate Limiting**: Implement client-side rate limiting to avoid exceeding server quotas.

4. **Error Handling**: Always implement proper error handling for API requests.

### Working with the Decentralized Registry

1. **Node Selection**: Connect to multiple registry nodes for resilience.

2. **Local Caching**: Cache frequently used server information to reduce API calls.

3. **Periodic Refreshing**: Regularly refresh server metadata to get the latest capabilities and status.

4. **Feedback Contribution**: Submit ratings and reviews to help improve the ecosystem quality.
