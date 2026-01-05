# @social/utils

Shared utility functions for Social apps.

## Usage

```typescript
import { generateAnonymousUsername } from '@social/utils';

// Generate a random username like "wAcKyFrOg420" or "cHaOtIcGaMeR69"
const username = generateAnonymousUsername();
```

## Functions

### `generateAnonymousUsername()`

Generates a random anonymous username by combining:
- Random adjective (e.g., "Chaotic", "Wacky", "Epic")
- Random noun (e.g., "Goblin", "Pixel", "Wizard")
- Random number (e.g., "69", "420", "1337")

Each word gets random capitalization for a fun, varied appearance.

**Returns:** `string` - A randomly generated username