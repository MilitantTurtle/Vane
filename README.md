# Vane 🔍

[![GitHub Repo stars](https://img.shields.io/github/stars/MilitantTurtle/Vane?style=social)](https://github.com/MilitantTurtle/Vane/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/MilitantTurtle/Vane?style=social)](https://github.com/MilitantTurtle/Vane/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/MilitantTurtle/Vane?style=social)](https://github.com/MilitantTurtle/Vane/watchers)
[![Build Linux container](https://github.com/MilitantTurtle/Vane/actions/workflows/build-container.yml/badge.svg)](https://github.com/MilitantTurtle/Vane/actions/workflows/build-container.yml)
[![GHCR image](https://img.shields.io/badge/GHCR-ghcr.io%2Fmilitantturtle%2Fvane-blue)](https://github.com/MilitantTurtle/Vane/pkgs/container/vane)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/MilitantTurtle/Vane?color=green)](https://github.com/MilitantTurtle/Vane/commits/master)
[![Discord](https://dcbadge.limes.pink/api/server/26aArMy8tT?style=flat)](https://discord.gg/26aArMy8tT)

> [!NOTE]
> **What this fork changes**
>
> This fork stays close to [ItzCrazyKns/Vane](https://github.com/ItzCrazyKns/Vane) and adds better support for local OpenAI-compatible servers such as llama.cpp:
>
> - Chat models are discovered automatically from the server's `/v1/models` endpoint.
> - If a previously selected model is no longer loaded, Vane falls back to the first model currently advertised by the server.
> - A public Linux AMD64 slim image is built by GitHub Actions and published as `ghcr.io/militantturtle/vane:latest`.
>
> The rest of Vane's behaviour remains unchanged from upstream.

Vane is a **privacy-focused AI answering engine** that runs entirely on your own hardware. It combines knowledge from the vast internet with support for **local LLMs** (Ollama) and cloud providers (OpenAI, Claude, Groq), delivering accurate answers with **cited sources** while keeping your searches completely private.

![preview](.assets/vane-screenshot.png)

Want to know more about its architecture and how it works? You can read it [here](docs/architecture/README.md).

## ✨ Features

🤖 **Support for all major AI providers** - Use local LLMs through Ollama or connect to OpenAI, Anthropic Claude, Google Gemini, Groq, and more. Mix and match models based on your needs.

⚡ **Smart search modes** - Choose Speed Mode when you need quick answers, Balanced Mode for everyday searches, or Quality Mode for deep research.

🧭 **Pick your sources** - Search the web, discussions, or academic papers. More sources and integrations are in progress.

🧩 **Widgets** - Helpful UI cards that show up when relevant, like weather, calculations, stock prices, and other quick lookups.

🔍 **Web search powered by SearxNG** - Access multiple search engines while keeping your identity private. Support for Tavily and Exa coming soon for even better results.

📷 **Image and video search** - Find visual content alongside text results. Search isn't limited to just articles anymore.

📄 **File uploads** - Upload documents and ask questions about them. PDFs, text files, images - Vane understands them all.

🌐 **Search specific domains** - Limit your search to specific websites when you know where to look. Perfect for technical documentation or research papers.

💡 **Smart suggestions** - Get intelligent search suggestions as you type, helping you formulate better queries.

📚 **Discover** - Browse interesting articles and trending content throughout the day. Stay informed without even searching.

🕒 **Search history** - Every search is saved locally so you can revisit your discoveries anytime. Your research is never lost.

✨ **More coming soon** - We're actively developing new features based on community feedback. Join our Discord to help shape Vane's future!

## Sponsors

Vane's development is powered by the generous support of our sponsors. Their contributions help keep this project free, open-source, and accessible to everyone.

<div align="center">
  
  
<a href="https://www.warp.dev/perplexica">
  <img alt="Warp Terminal" src=".assets/sponsers/warp.png" width="100%">
</a>

### **✨ [Try Warp - The AI-Powered Terminal →](https://www.warp.dev/vane)**

Warp is revolutionizing development workflows with AI-powered features, modern UX, and blazing-fast performance. Used by developers at top companies worldwide.

</div>

---

We'd also like to thank the following partners for their generous support:

<table>
  <tr>
    <td width="100" align="center">
      <a href="https://dashboard.exa.ai" target="_blank">
        <img src=".assets/sponsers/exa.png" alt="Exa" width="80" height="80" style="border-radius: .75rem;" />
      </a>
    </td>
    <td>
      <a href="https://dashboard.exa.ai">Exa</a> • The Perfect Web Search API for LLMs - web search, crawling, deep research, and answer APIs
    </td>
  </tr>
</table>

## Installation

This fork uses the **slim Vane container** and expects a separate SearXNG instance. It does not bundle SearXNG.

Before starting, make sure your SearXNG instance:

- Is reachable from the Docker host and the Vane container.
- Has JSON response format enabled.
- Has the Wolfram Alpha search engine enabled.

Replace `http://your-searxng-host:8080` below with the address that the Vane container can reach. Change the left side of `3000:3000` if port 3000 is already in use.

### Option 1: Use the prebuilt Linux image

This is the recommended option for Linux AMD64 Docker hosts and Portainer. The public image is built by GitHub Actions and does not require registry credentials.

```yaml
services:
  vane:
    image: ghcr.io/militantturtle/vane:latest
    container_name: vane
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      SEARXNG_API_URL: "http://your-searxng-host:8080"
    volumes:
      - vane-data:/home/vane/data

volumes:
  vane-data:
```

Save this as `compose.yaml` and run:

```bash
docker compose up -d
```

In Portainer, paste the same YAML into a new stack's Web editor.

### Option 2: Build this fork yourself

Clone this fork on the Docker host:

```bash
git clone https://github.com/MilitantTurtle/Vane.git
cd Vane
```

Save the following as `compose.yaml` in the repository root:

```yaml
services:
  vane:
    build:
      context: .
      dockerfile: Dockerfile.slim
    image: vane-local:latest
    container_name: vane
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      SEARXNG_API_URL: "http://your-searxng-host:8080"
    volumes:
      - vane-data:/home/vane/data

volumes:
  vane-data:
```

Build and start it:

```bash
docker compose up -d --build
```

For Portainer, use a Git repository stack pointing at this fork so the Docker build context is available. The prebuilt-image option is quicker and simpler.

### Configure Vane

Open `http://<docker-host>:3000` (or your chosen host port) and complete the setup screen. For a local OpenAI-compatible server such as llama.cpp:

- Enter an API URL reachable from the Vane container.
- If your server does not require an API key, enter any non-empty placeholder in Vane's API-key field.
- This fork discovers the currently loaded chat model from `/v1/models`; you do not need to keep a static model name synchronized manually.

Settings and history are stored in the `vane-data` volume.

### Updating

For the prebuilt image:

```bash
docker compose pull
docker compose up -d
```

For a local source build:

```bash
git pull
docker compose up -d --build
```

See the [installation documentation](docs/installation) for additional background inherited from upstream. Where those documents differ, use the fork-specific instructions above.

## Troubleshooting

### Local OpenAI-compatible servers

If Vane says no chat-model provider is configured:

1. Confirm the API URL is reachable from inside the Vane container. A server bound only to `127.0.0.1` will not be reachable from another machine or container.
2. Confirm the server exposes an OpenAI-compatible `/v1/models` endpoint and currently has a model loaded.
3. Enter a non-empty placeholder in Vane's API-key field if the server itself does not require a key.

This fork reads the live model list automatically and falls back to the first currently advertised model when a previously selected model is no longer loaded.

### Ollama Connection Errors

If you're encountering an Ollama connection error, it is likely due to the backend being unable to connect to Ollama's API. To fix this issue you can:

1. **Check your Ollama API URL:** Ensure that the API URL is correctly set in the settings menu.
2. **Update API URL Based on OS:**

   - **Windows:** Use `http://host.docker.internal:11434`
   - **Mac:** Use `http://host.docker.internal:11434`
   - **Linux:** Use `http://<private_ip_of_host>:11434`

   Adjust the port number if you're using a different one.

3. **Linux Users - Expose Ollama to Network:**

   - Inside `/etc/systemd/system/ollama.service`, you need to add `Environment="OLLAMA_HOST=0.0.0.0:11434"`. (Change the port number if you are using a different one.) Then reload the systemd manager configuration with `systemctl daemon-reload`, and restart Ollama by `systemctl restart ollama`. For more information see [Ollama docs](https://github.com/ollama/ollama/blob/main/docs/faq.md#setting-environment-variables-on-linux)

   - Ensure that the port (default is 11434) is not blocked by your firewall.

### Lemonade Connection Errors

If you're encountering a Lemonade connection error, it is likely due to the backend being unable to connect to Lemonade's API. To fix this issue you can:

1. **Check your Lemonade API URL:** Ensure that the API URL is correctly set in the settings menu.
2. **Update API URL Based on OS:**

   - **Windows:** Use `http://host.docker.internal:8000`
   - **Mac:** Use `http://host.docker.internal:8000`
   - **Linux:** Use `http://<private_ip_of_host>:8000`

   Adjust the port number if you're using a different one.

3. **Ensure Lemonade Server is Running:**

   - Make sure your Lemonade server is running and accessible on the configured port (default is 8000).
   - Verify that Lemonade is configured to accept connections from all interfaces (`0.0.0.0`), not just localhost (`127.0.0.1`).
   - Ensure that the port (default is 8000) is not blocked by your firewall.

## Using as a Search Engine

If you wish to use Vane as an alternative to traditional search engines like Google or Bing, or if you want to add a shortcut for quick access from your browser's search bar, follow these steps:

1. Open your browser's settings.
2. Navigate to the 'Search Engines' section.
3. Add a new site search with the following URL: `http://localhost:3000/?q=%s`. Replace `localhost` with your IP address or domain name, and `3000` with the port number if Vane is not hosted locally.
4. Click the add button. Now, you can use Vane directly from your browser's search bar.

## Using Vane's API

Vane also provides an API for developers looking to integrate its powerful search engine into their own applications. You can run searches, use multiple models and get answers to your queries.

For more details, check out the full documentation [here](docs/API/SEARCH.md).

## Expose Vane to network

Vane runs on Next.js and handles all API requests. It works right away on the same network and stays accessible even with port forwarding.

## Upcoming Features

- [ ] Adding more widgets, integrations, search sources
- [ ] Adding ability to create custom agents (name T.B.D.)
- [ ] Adding authentication

## Support Us

If you find Vane useful, consider giving us a star on GitHub. This helps more people discover Vane and supports the development of new features. Your support is greatly appreciated.

### Donations

We also accept donations to help sustain our project. If you would like to contribute, you can use the following options to donate. Thank you for your support!

| Ethereum                                              |
| ----------------------------------------------------- |
| Address: `0xB025a84b2F269570Eb8D4b05DEdaA41D8525B6DD` |

## Contribution

Vane is built on the idea that AI and large language models should be easy for everyone to use. If you find bugs or have ideas, please share them in via GitHub Issues. For more information on contributing to Vane you can read the [CONTRIBUTING.md](CONTRIBUTING.md) file to learn more about Vane and how you can contribute to it.

## Help and Support

For problems specific to this fork, [open an issue here](https://github.com/MilitantTurtle/Vane/issues). For general Vane discussion and upstream support, use the [upstream Discord server](https://discord.gg/EFwsmQDgAu).

Thank you for exploring Vane, the AI-powered search engine designed to enhance your search experience. We are constantly working to improve Vane and expand its capabilities. We value your feedback and contributions which help us make Vane even better. Don't forget to check back for updates and new features!
