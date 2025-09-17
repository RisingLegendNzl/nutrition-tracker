# brain/ (data modules)

This folder holds Nutrify's data "brain", split into small importable modules.
- `supps.data.js` — default supplement stack, suggestions, alias map.

Usage from `/js/supps.js`:
```js
import { defaultSupps, SMART_SUGGESTIONS, ALIAS_TO_CANON } from '../brain/supps.data.js';
```
Back-compat: each module also attaches its exports to `window.*` if they aren't already present, so old code keeps working while we migrate.
