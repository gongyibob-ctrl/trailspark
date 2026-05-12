// Trail IDs shown in the landing-page "Featured" grid. Hand-picked for:
//  - all 4 difficulty colors visible across the 6 cards (easy/mod/hard/extreme)
//  - 6 different regions of the West Coast
//  - recognizable names / iconic shapes
//
// Order is the on-screen layout left-to-right, top-to-bottom. Coordinate
// data for these trails lives in `lib/featured-coords.json`, regenerated
// by `scripts/extract-featured-coords.mjs` when this list changes.
export const FEATURED_IDS = [
  "hurricane-hill",      // easy     · Olympic NP · WA
  "mist-trail",          // moderate · Yosemite NP · CA
  "multnomah-wahkeena",  // moderate · Columbia River Gorge · OR
  "cascade-pass",        // hard     · North Cascades NP · WA
  "south-sister",        // hard     · Three Sisters Wilderness · OR
  "half-dome",           // extreme  · Yosemite NP · CA
];
