# RECORDING_GUIDE.md — deprecated, see DEMO_SCRIPT.md

This file was an earlier alternate storyboard. The **single source of truth** is now:

- **Storyboard + assembly recipe:** [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)
- **VO script (regenerable):** [`../video/vo/script.txt`](../video/vo/script.txt) (regenerate audio with `python ../video/vo/generate.py`)
- **VO assets:** `../video/vo/cut-01-morning.mp3` … `cut-10-title.mp3`
- **Still frames:** `../video/assets/01-morning-modal.png` … `13-write-filled.png`

If you only have five minutes, go straight to the [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) assembly recipe.

---

## Hero GIF (optional, for README top)

A 10-second looping GIF of the Ask tab streaming is still a good idea for the README header. Quick recipe:

1. Tool: **ScreenToGif** (Windows) or **Gifski** (macOS).
2. Capture 1280×800, 20 fps, from the moment you press Enter on the seeded question to the token stream completing (~8 s).
3. Export as `docs/assets/offmind-hero.gif`, target < 1.5 MB.
4. Add to the README right below the H1:
   ```markdown
   <div align="center">

   ![OffMind Hero](docs/assets/offmind-hero.gif)

   </div>
   ```

## Pre-submit dry run

Hand the README to someone who has never seen the repo. If they can reach their first answered question inside 5 minutes of `git clone`, you're shippable.
