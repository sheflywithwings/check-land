export const createUISlice = (set, get) => {
  return {
    selectedTool: 'pencil',
    setSelectedTool: (newSelectedTool) => set(() => ({ selectedTool: newSelectedTool })),
  }
}
