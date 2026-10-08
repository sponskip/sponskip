# Sponskip

Skip known sponsor and self-promotion segments on YouTube, with local caption-based detection as a fallback.

Sponskip is a Chrome extension for YouTube. It checks public SponsorBlock data first, then can inspect available captions locally when no segment is available. Detection is not perfect; review the limitations before installing.

## Install

Chrome Web Store availability will be linked here after the listing is approved. Until then, download the latest release ZIP or load this directory unpacked:

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select this repository directory.

## How it works

1. Sponskip requests public SponsorBlock timestamps for `sponsor` and `selfpromo` segments.
2. If no public segment is available and captions are available, Sponskip checks caption text locally for sponsor-read patterns.
3. With auto-skip enabled, Sponskip seeks the YouTube player past detected segments.

## Limitations

SponsorBlock coverage varies by video. Caption-based detection is heuristic: it can miss sponsor reads and may occasionally identify a non-sponsor segment incorrectly. Sponskip only operates on supported YouTube watch pages.

## Privacy

Read the full [privacy disclosure](docs/PRIVACY.md). Sponskip has no analytics or Sponskip-operated backend. It requests public SponsorBlock segment data for the current video and stores controls and statistics in your browser.

## Support

Use [GitHub Issues](https://github.com/sponskip/sponskip/issues) for bugs and feature requests. Please do not include private or unlisted video URLs in reports.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Security

See [SECURITY.md](SECURITY.md) for responsible vulnerability reporting.

## Third-party services

Sponskip uses the public [SponsorBlock API](https://sponsor.ajay.app/) for crowd-sourced segment timestamps. Sponskip is not affiliated with SponsorBlock, YouTube, or Google.

## License

Sponskip is source-available under its [proprietary non-commercial license](LICENSE). It is not open source.
