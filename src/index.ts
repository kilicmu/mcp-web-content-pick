import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { scraping } from 'web-structure';
import { Validator } from 'jsonschema';

const WEB_CONTENT_PICK_TOOL_NAME = "web-content-pick";
const WEB_CONTENT_PICK_INPUT_SCHEMA = {
    type: "object",
    properties: {
        url: {
            type: "string",
            description: "Web URL to extract structured content from"
        },
        options: {
            type: "object",
            properties: {
                maxDepth: {
                    type: "number",
                    description: "Maximum depth for recursive crawling. If a page contains child links, they will be crawled by default. The more child links, the slower the crawling process.",
                    default: 0
                },
                excludeChildPage: {
                    type: "object",
                    description: "Function to determine whether to exclude a child page from crawling",
                    properties: {
                        function: {
                            type: "string",
                            pattern: "^function\\s*\\(url\\)\\s*\\{[^}]*\\}$"
                        }
                    }
                },
                selectors: {
                    type: "object",
                    description: "Selectors to extract content from the page",
                    additionalProperties: {
                        oneOf: [
                            { type: "string" },
                            {
                                type: "array",
                                items: { type: "string" }
                            }
                        ]
                    },
                    default: {
                        headings: ["h1", "h2", "h3", "h4", "h5"],
                        paragraphs: "p",
                        articles: "article",
                        spans: "span",
                        orderLists: "ol",
                        lists: "ul"
                    }
                },
                withConsole: {
                    type: "boolean",
                    description: "Whether to show console information",
                    default: true
                },
                breakWhenFailed: {
                    type: "boolean",
                    description: "Whether to break when a page fails",
                    default: false
                },
                retryCount: {
                    type: "number",
                    description: "Number of retries when scraping a page fails",
                    default: 3
                },
                waitForSelectorTimeout: {
                    type: "number",
                    description: "Timeout for waiting for a selector to be present",
                    default: 12000
                },
                waitForPageLoadTimeout: {
                    type: "number",
                    description: "Timeout for waiting for a page to load",
                    default: 12000
                }
            },
            additionalProperties: false
        }
    },
    required: ["url"],
}
const WEB_CONTENT_PICK_TOOL = {
    name: WEB_CONTENT_PICK_TOOL_NAME,
    description: "Extracts structured content from a given web URL, providing a comprehensive analysis of the page structure. " +
        "Returns organized data including headings, paragraphs, links, images, tables, and metadata. " +
        "Ideal for content analysis, web scraping, and generating structured representations of web pages. " +
        "Supports HTML parsing with clean, hierarchical output format.",
    inputSchema: WEB_CONTENT_PICK_INPUT_SCHEMA,
};
// Server implementation
const server = new Server({
    name: "web-content-pick-server",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
let requestCount = {
    second: 0,
    month: 0,
    lastReset: Date.now()
};

type PickStructureOptions = Parameters<typeof scraping>[1]
type PickStructureArgs = {
    url: string,
    options: PickStructureOptions
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [WEB_CONTENT_PICK_TOOL],
}));
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    try {
        const { name, arguments: args } = request.params;
        if (!args) {
            throw new Error("No arguments provided");
        }
        switch (name) {
            case WEB_CONTENT_PICK_TOOL_NAME: {
                const validateResult = new Validator().validate(args, WEB_CONTENT_PICK_INPUT_SCHEMA);
                if (!validateResult.valid) {
                    return {
                        content: [{ type: "text", text: `Invalid arguments: ${JSON.stringify(validateResult.errors)}` }],
                        isError: true,
                    };
                }
                const { url, options } = validateResult.instance as PickStructureArgs;
                const results = await scraping(url, {
                    withConsole: false,
                    breakWhenFailed: false,
                    ...(options || {})
                });

                return {
                    content: [{
                        type: "text", text: `
                        content of page struct: 
                        ${JSON.stringify(results)}
                        ` }],
                    isError: false,
                };
            }
            default:
                return {
                    content: [{ type: "text", text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`${WEB_CONTENT_PICK_TOOL.name} Server running on stdio`);
}
runServer().catch((error) => {
    console.error(`Fatal error running server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
