import create from 'zustand'
import { createUISlice } from './createUISlice'

const useStore = create((set, get) => ({
  ...createUISlice(set, get),
}))

export default useStore
