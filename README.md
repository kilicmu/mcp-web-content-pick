# @modelcontextprotocol/web-content-pick

A powerful tool for extracting structured content from web pages with customizable selectors and crawling options. Part of the Model Context Protocol toolkit.

## Features

- 🌐 Extract structured content from any web page
- 🎯 Customizable CSS selectors for content targeting
- 🌲 Recursive crawling with depth control
- 🔄 Automatic retry mechanism
- ⚡ Fast and efficient processing
- 📝 Clean, hierarchical output format

## Usage

1. install the tool with `npm install -g mcp-web-content-pick`

2. add config in claude_desktop_config.json
```json
{
  "mcpServers": {
    "web_content_search": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-web-content-pick"
      ]
    }
  }
}
```


