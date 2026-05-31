// Shared event name for coordinating UI around the homepage loading overlay.
// Lives in its own module so consumers (e.g. ConsentManagerLazy) don't have to
// import the Loader component just to reference the event.

// Dispatched on `window` when the loading overlay finishes sliding up.
export const LOADER_DISMISSED_EVENT = 'app:loader-dismissed';
