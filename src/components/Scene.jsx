import { useRef, useEffect } from 'react'
import { useZustand } from '../store/useZustand'
import { ThreeWorld } from '../utils/three.world'

let isFirstRender = true

export const Scene = () => {
  const { threeWorld, setThreeWorld, selectedTool } = useZustand()
  const sceneRef = useRef(null)

  useEffect(() => {
    if (isFirstRender) {
      const el = document.createElement('div')
      el.className = 'absolute w-full h-full'
      sceneRef.current.innerHTML = ''
      sceneRef.current.appendChild(el)
      const newThreeWorld = new ThreeWorld({ domEl: el })
      console.log('Scene#useEffect: newThreeWorld: ', newThreeWorld)
      setThreeWorld(newThreeWorld)
      isFirstRender = false
    }
  }, [])

  return (
    <div
      className='absolute w-full h-full'
      ref={sceneRef}
      onMouseDown={event => {
        if (!threeWorld) return
        threeWorld.onMouseDown({ event, tool: selectedTool })
      }}
      onMouseMove={event => {
        if (!threeWorld) return
        threeWorld.onMouseMove({ event, tool: selectedTool })
      }}
      onMouseUp={event => {
        if (!threeWorld) return
        threeWorld.onMouseUp({ event, tool: selectedTool })
      }}
    />
  )
}
