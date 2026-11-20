<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="referrer" content="strict-origin-when-cross-origin"/>
        <title><xsl:value-of select="/rss/channel/title"/> — RSS Feed</title>
        <style>
          :root {
            --bg: #fbfaf7;
            --fg: #16181d;
            --muted: #5f6672;
            --card: #ffffff;
            --border: #e6e3dc;
            --accent: #4f46e5;
            --accent2: #0f9d76;
            --soft: #f2f0ea;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0b0d12;
              --fg: #e8eaf0;
              --muted: #9aa3b2;
              --card: #12151c;
              --border: #222736;
              --accent: #8b8cff;
              --accent2: #34d399;
              --soft: #171b25;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--fg);
            font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }
          .wrap {
            max-width: 820px;
            margin: 0 auto;
            padding: 28px 20px 56px;
          }
          .topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border);
          }
          .brand {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            color: var(--fg);
            font-weight: 600;
            font-size: 14px;
          }
          .back {
            font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 12px;
            color: var(--accent);
            text-decoration: none;
          }
          .back:hover { text-decoration: underline; }
          .notice {
            margin-top: 22px;
            background: var(--card);
            border: 1px solid var(--border);
            border-left: 4px solid var(--accent2);
            border-radius: 12px;
            padding: 16px 18px;
            font-size: 14px;
          }
          .notice-eyebrow {
            font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--accent2);
            margin-bottom: 6px;
          }
          .notice p { margin: 0; color: var(--muted); }
          .feed-url {
            display: inline-block;
            margin-top: 10px;
            padding: 4px 10px;
            border-radius: 8px;
            background: var(--soft);
            border: 1px solid var(--border);
            color: var(--fg);
            font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 12.5px;
            word-break: break-all;
          }
          .header {
            margin: 28px 0 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            line-height: 1.2;
            letter-spacing: -0.02em;
          }
          .header p {
            margin: 8px 0 0;
            color: var(--muted);
            font-size: 15px;
          }
          .items {
            display: grid;
            gap: 14px;
            margin-top: 20px;
          }
          .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 18px 20px;
            transition: border-color 0.15s ease;
          }
          .card:hover { border-color: var(--accent); }
          .meta {
            font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 12px;
            color: var(--muted);
          }
          .card h2 {
            margin: 6px 0 8px;
            font-size: 18px;
            line-height: 1.35;
          }
          .card h2 a {
            color: var(--fg);
            text-decoration: none;
          }
          .card h2 a:hover { color: var(--accent); }
          .desc {
            margin: 0;
            font-size: 14px;
            color: var(--muted);
          }
          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 12px;
          }
          .tag {
            font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 11px;
            color: var(--muted);
            background: var(--soft);
            border: 1px solid var(--border);
            border-radius: 999px;
            padding: 2px 9px;
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="topbar">
            <a class="brand" href="/">
              <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
                <rect width="64" height="64" rx="14" fill="#0f1117"/>
                <path d="M18 15v34M46 15v34" stroke="#f8fafc" stroke-width="6" stroke-linecap="round"/>
                <path d="M32 21l3.2 7.8L43 32l-7.8 3.2L32 43l-3.2-7.8L21 32l7.8-3.2z" fill="#34d399"/>
              </svg>
              <span>Harshit Bhadauria · HSB Learnings</span>
            </a>
            <a class="back" href="/">← Back to HSB Learnings</a>
          </div>

          <div class="notice">
            <div class="notice-eyebrow">// RSS 2.0 Web Feed</div>
            <p>
              This is an RSS feed preview. To subscribe, copy this feed URL and paste it into your feed reader (such as Feedly, NetNewsWire, or Inoreader):
            </p>
            <code class="feed-url">https://hbhadauria.github.io/feed.xml</code>
          </div>

          <header class="header">
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p><xsl:value-of select="/rss/channel/description"/></p>
          </header>

          <main class="items">
            <xsl:for-each select="/rss/channel/item">
              <article class="card">
                <div class="meta"><xsl:value-of select="pubDate"/></div>
                <h2>
                  <a href="{link}"><xsl:value-of select="title"/></a>
                </h2>
                <p class="desc"><xsl:value-of select="description"/></p>
                <xsl:if test="category">
                  <div class="tags">
                    <xsl:for-each select="category">
                      <span class="tag">#<xsl:value-of select="."/></span>
                    </xsl:for-each>
                  </div>
                </xsl:if>
              </article>
            </xsl:for-each>
          </main>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
