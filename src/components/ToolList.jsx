import PencilSvg from '../assets/icons/pencil.svg'
import FillSvg from '../assets/icons/fill.svg'

export const ToolList = () => {
  return (
    <div className='absolute flex flex-col p-2 gap-2 top-2 border border-black left-2 rounded bg-green-900'>
      <div className='p-2 border rounded border-black cursor-pointer'>
        <img className='w-8' src={PencilSvg}></img>
      </div>
      <div className='p-2 border rounded border-black cursor-pointer'>
        <img className='w-8' src={FillSvg}></img>
      </div>
    </div>
  )
}
