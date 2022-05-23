# CA legislature hearing transcripts

## Steps

### Step 1 - Scrape media archives for URLs

`node steps/step-1-scrape-media.archives.mjs`

Look at all of the hearings on these two media archive sites, one per chamber, and scrape the date, the title, and the URLs for some of the media. Save it all to `hearings.json`.

* [https://www.assembly.ca.gov/media-archive](https://www.assembly.ca.gov/media-archive)
* [https://www.senate.ca.gov/media-archive](https://www.senate.ca.gov/media-archive)

### Step 2 - Download transcripts

`node steps/step-2-download-transcripts.mjs`

Download the closed captions/transcript for each hearing from `hearings.json` (it's a `.vtt` file) if it hasn't been downloaded before.

The `.vtt` file will be saved in `/transcripts` and be prefixed with the chamber such as `assembly-` or `senate-`.

### Step 3 - Extract text

`node steps/step-3-extract-text.mjs`

Use the `.vtt` files from step 2 and strip out the time stamps and combine all the rows into one line of text.

Generates files with the same name as step 2 but with a `.txt` file extension.