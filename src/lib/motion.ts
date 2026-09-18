// Entry choreography, in seconds.
//
// The first-paint intro (Loader.tsx) keeps its timeline in styles.css and sets `preloader-done` when
// its exit wipe starts. Hero entry is gated on that class; its own inline delay controls its start.
//
// Below the fold there is no cascade to time either: those sections animate only their bracket label
// (its own gated transition), and their copy renders static.

export const PRELOADER_CLOSE_DURATION = 1.2 // route curtain, each direction
