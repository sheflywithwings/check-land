import classNames from 'classnames'
import PencilSvg from '../assets/icons/pencil.svg'
import FillSvg from '../assets/icons/fill.svg'
import CheckSvg from '../assets/icons/check.svg'
import { useZustand } from '../store/useZustand'

export const ToolList = () => {
  const { selectedTool, setSelectedTool } = useZustand()

  return (
    <div className='absolute flex flex-col p-2 gap-2 top-2 border border-black left-2 rounded bg-green-900'>
      <div
        className={classNames(
          {
            'p-2 border rounded border-black cursor-pointer': true,
            'border-red-900': (selectedTool === 'pencil')
          }
        )}
        onClick={() => setSelectedTool('pencil')}
      >
        <img className='w-8' src={PencilSvg}></img>
      </div>
      <div
        className={classNames(
          {
            'p-2 border rounded border-black cursor-pointer': true,
            'border-red-900': (selectedTool === 'fill')
          }
        )}
        onClick={() => setSelectedTool('fill')}
      >
        <img className='w-8' src={FillSvg}></img>
      </div>
      <div
        className={classNames(
          {
            'p-2 border rounded border-black cursor-pointer': true,
            'border-red-900': (selectedTool === 'check')
          }
        )}
        onClick={() => setSelectedTool('check')}
      >
        <img className='w-8' src={CheckSvg}></img>
      </div>
    </div >
  )
}
