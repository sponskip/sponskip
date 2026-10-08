# Chrome Web Store Listing — Sponskip

## Single purpose

Sponskip skips SponsorBlock sponsor and self-promotion segments in YouTube videos and can locally inspect available captions to identify likely sponsor reads.

## Verified data behavior

| Data | Purpose | Destination |
| --- | --- | --- |
| YouTube page and video ID | Locate and control the video | The current YouTube tab; the video ID is also used for the public SponsorBlock request. |
| Caption text | Local fallback matching | Extension memory only. |
| Settings and statistics | Remember controls and counts | `chrome.storage.local` only. |
| SponsorBlock request | Retrieve segment timestamps | `https://sponsor.ajay.app`; no Sponskip-operated server receives data. |

## Short description

Skip sponsor and self-promotion segments on YouTube.

## Detailed description

Sponskip checks public SponsorBlock segments when you watch a YouTube video. When captions are available and no public segment is found, it can inspect those captions locally for likely sponsor reads. With auto-skip enabled, Sponskip moves playback past the segments it finds.

SponsorBlock coverage and caption-based detection vary by video. Sponskip is not affiliated with YouTube, Google, or SponsorBlock.

## Draft listing fields

- Category: Productivity
- Language: English (United States)
- Support URL: `https://github.com/sponskip/sponskip/issues`
- Privacy policy URL: `https://sponskip.com/privacy.html`
- Single purpose: Skip sponsor and self-promotion segments on YouTube.
