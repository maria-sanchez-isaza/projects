# Bellevue College International Education WebXR

Publish the contents of this folder to a GitHub repository. Under Settings → Pages, deploy from main and /(root). Open the resulting HTTPS URL. All runtime scripts, models, audio and splat assets are bundled; no backend or build is needed after uploading.

## Scene Editor (desktop)

Open Editor and select a mode:

- **Object Editing:** choose the advisor, question panel, hotspot or floor vertex. Use Move (W), Rotate (E), Scale (R), or numeric fields as appropriate. Click **Save Object** to commit placement. Switching objects or closing the editor discards an unsaved transform preview.
- **Viewpoint Editing:** choose Player Start or a hotspot landing viewpoint. Navigate with WASD / Q,E and drag to look. Click **Save Viewpoint** to capture the camera position, heading and vertical look angle. **Preview Saved Viewpoint** loads that saved view; **Return to Editing** restores the previous camera. Camera movement alone does not change saved viewpoints.
- **Exploration:** floor height, vertex additions/removals and hotspot metadata remain drafts until saved. Use **Save Floor** for the polygon and height; **Save Hotspot Settings** for a selected hotspot's name/radius. Saving a floor vertex with Save Object commits the current floor draft. Removing a hotspot is an explicit saved deletion.

There is no arbitrary named-position creation system. Existing positions are preserved in the configuration. Viewpoint editing captures the current camera instead of using gizmos.

## One scene file

**Export World Scene JSON** downloads `world-scene.json`, containing all saved objects, the player viewpoint, hotspot settings and landing viewpoints, and teleport floor settings. Unsaved previews/drafts are excluded. **Import** restores this complete configuration and saves it in the current browser.

For published defaults, replace **data/world-scene.json** with the export, commit/upload it, and refresh the website. If working from the development source, replace webxr-dev/site/data/world-scene.json and run `node webxr-dev/build.cjs` from the project folder first. Legacy data/positions.json, world.json and navigation.json are retained for reference; the runtime now loads only world-scene.json.

Browser localStorage retains saved edits for convenience. Existing browser saves from the previous editor migrate on first use. A browser with local edits uses those saved edits until another complete configuration is imported. New visitors use the bundled file. Export JSON to transfer settings between computers.

Positions use the fixed scene coordinate system. The legacy AvisorPosition spelling and its Y eye-height offset convention are retained. Viewpoints store actual world eye positions; rotations use degrees. In VR, saved position and heading are applied with headset-pose compensation; vertical looking remains controlled by natural head tracking. Desktop/mobile also use the saved vertical look angle.

## Navigation and interaction

Desktop: drag to look, WASD/arrows to move, Q/E for vertical movement. Mobile: drag to look and use the circular joystick. Quest: left stick moves, right stick snaps 30 degrees; hold/release left trigger for polygon-bounded teleportation; right trigger selects buttons or a hotspot ring. Clicking/tapping a ring uses its saved landing viewpoint and activates the CPT interaction. Rings remain visible. Enter VR appears when supported. Controller models and optional tracked hand meshes load locally; hands are visual only.

The splat has no furniture/wall collision geometry. Adjust the floor polygon and viewpoints in the editor, and verify comfort, positions, controller/hand switching and audio on Quest. The advisor, Idle/Talking clips and audio-driven mouth movement are preserved.

The question card now hides when the player leaves the hotspot radius and returns on re-entry without resetting question progress. Editor preview still displays the panel for placement.
