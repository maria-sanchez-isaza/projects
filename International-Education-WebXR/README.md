# International Education WebXR

Copy the contents of this folder to the root of a GitHub repository. In GitHub, open **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, then save. Open the resulting HTTPS address on a desktop, mobile device, or Quest browser. No build or server is required after publishing.

Drag to look, use WASD or arrows to move, and Q/E to change height. On touch devices, drag and use the on-screen arrows. Enter VR appears when the browser reports immersive VR support; thumbsticks provide basic movement. HTTPS is required for WebXR. The editor is intended for desktop.

The Editor stores named positions in the current browser. Export JSON to transfer or back up positions. To make exported positions the defaults for all users, replace `data/positions.json` in the repository with the export. Changes in the editor cannot write directly to GitHub. Rotation is in degrees about Y; position and rotation use world coordinates. `playerStart` sets the initial camera position and yaw. Existing local data overrides the defaults on that browser.

The office uses the smaller original PLY, with a fixed -90° rotation about X to make its Z axis vertical. Do not change this transform after saving positions. The initial viewpoint is an estimate and can be refined with the editor. The site uses Spark 2.4.0 and Three.js 0.180.0, bundled locally. Quest and mobile performance depend on the device; no collision detection is provided.
