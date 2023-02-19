import create from 'zustand'
import { createUISlice } from './createUISlice'

export const useZustand = create((set, get) => ({
  ...createUISlice(set, get),
}))
