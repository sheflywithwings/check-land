export const createSceneSlice = (set, get) => {
  return {
    threeWorld: null,
    setThreeWorld: (newThreeWorld) => set(() => ({ threeWorld: newThreeWorld })),
  }
}
