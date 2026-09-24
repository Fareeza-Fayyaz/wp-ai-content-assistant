# WP AI Content Assistant

A WordPress block-editor sidebar for drafting an outline, writing an introduction, improving text, and summarizing text. Suggestions are previewed before insertion. Nothing is published automatically.

## Requirements

- WordPress 7.0 or later, PHP 7.4 or later
- A text-generation AI provider configured at **Settings → Connectors**
- The block editor (Gutenberg); an account allowed to edit the post

## Install

1. Download this repository as a ZIP, or copy the `wp-ai-content-assistant` folder to `wp-content/plugins/`.
2. Activate **WP AI Content Assistant** in **Plugins**.
3. In **Settings → Connectors**, configure a text-capable AI provider. The provider handles its own credentials; no key belongs in this repository.
4. Open a post in the block editor, save it as a draft, and open the **AI Content Assistant** sidebar from the editor's top toolbar or Plugins menu.
5. Choose an action and enter a topic or text. Click **Generate suggestion**, review the result, then click **Insert into post** if useful.

## Privacy and costs

Only the topic and text you explicitly enter into the sidebar are sent to your configured AI provider when you press Generate. Provider charges and retention policies depend on your provider. Never submit confidential client text without permission. The plugin does not store prompts, responses, or provider keys, and it does not publish posts.

## Development

No Composer or Node dependencies are needed. The plugin uses WordPress's bundled editor packages. The REST endpoint is `POST /wp-json/wp-ai-content-assistant/v1/suggest` and requires an authenticated editor with permission to edit the specified `post_id`. WordPress REST cookie authentication supplies the nonce through `wp.apiFetch` in the block editor.

Example request body: `{"post_id":123,"task":"outline","topic":"WordPress performance","text":"","tone":"clear"}`.

Allowed tasks: `outline`, `intro`, `improve`, `summary`. Tone: `clear`, `friendly`, `professional`. Text is capped at 6,000 characters and topic at 500. AI text is inserted as paragraph blocks, so headings and bullet markers in the suggestion remain plain text for the editor to format.

## Manual QA

- Configure a text-capable provider and generate each of the four tasks. Confirm response appears in preview without changing the post.
- Insert a suggestion, verify existing post blocks remain and review the new paragraphs.
- Try an empty topic and text, an empty text for Improve/Summarize, and a user without permission to edit the requested post. Confirm each request fails.
- Disable the provider and confirm generation reports an error without altering the post.

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).
