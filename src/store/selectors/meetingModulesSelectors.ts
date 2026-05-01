import type { RootState } from "../index";

export const selectTotalModulesCountRounded = (state: RootState): number => {
  const count = state.meetingModules.modules.length;
  if (count === 0) return 0;
  return Math.floor(count / 10) * 10;
};
