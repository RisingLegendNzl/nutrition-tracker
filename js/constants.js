// js/constants.js
// Central constants: LocalStorage keys, event names, feature flags (minimal for Phase 1).

export const LS_NS = 'NUTRIFY__';

export const LS_KEYS = Object.freeze({
  VERSION: `${LS_NS}VERSION`,
  PROFILE: `${LS_NS}PROFILE`,
  PLAN:    `${LS_NS}PLAN`,
  HYDRO:   `${LS_NS}HYDRO`,
  SUPPS:   `${LS_NS}SUPPS`,
});

export const EVENT_NAMES = Object.freeze({
  PLAN_UPDATED: 'nutrify:planUpdated',
});
