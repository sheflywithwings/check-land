import { useRef, useEffect } from 'react'
import { initScene } from '../utils/three.world'

let isFirstRender = true

export const Scene = () => {
  const sceneRef = useRef(null)

  useEffect(() => {
    if (isFirstRender) {
      const el = document.createElement('div')
      el.className = 'absolute w-full h-full'
      sceneRef.current.innerHTML = ''
      sceneRef.current.appendChild(el)
      initScene(el)
      isFirstRender = false
    }
  }, [])

  return (
    <div className='absolute w-full h-full' ref={sceneRef} />
  )
}
