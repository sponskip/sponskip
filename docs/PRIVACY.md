# Privacy disclosure

## Data Sponskip accesses

Sponskip runs on supported YouTube watch pages. It reads the active page's video identifier, player state, and available captions so it can find and skip sponsor segments.

## Data Sponskip stores

Sponskip stores its settings, cached segment timestamps, and aggregate skip statistics in `chrome.storage.local` on the device. It does not use Chrome sync storage.

## Third-party request

Sponskip sends the current video identifier to the public SponsorBlock API at `https://sponsor.ajay.app` to request crowd-sourced segment timestamps. That request is made from the browser and is subject to SponsorBlock's own data practices. Sponskip does not operate a server that receives this data.

## No Sponskip analytics

Sponskip includes no analytics, advertising, telemetry, or error-reporting service. It does not sell or monetize viewing activity.

## Your controls

You can disable auto-skip, skip notifications, badge counts, and sound notifications in Sponskip's settings. Clearing extension data removes cached segments and local statistics.

## No affiliation

Sponskip is independent and is not affiliated with YouTube, Google, or SponsorBlock.
