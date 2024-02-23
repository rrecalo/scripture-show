import ReactSlider from "react-slider"
import ProjectionConfiguration from "../../types/ProjectionConfiguration"

type Props = {
    config: ProjectionConfiguration,
    range: number[],
    onChange: Function,
    sliderLabel: string,
    displayedValue: string,
    calculatedValue: number,
}
//Verse Font Weight 
//1 - 9 range
//(e)=>handleVerseTextWeightChange(e*100)
//config?.verseTextWeight
//config?.verseTextWeight/100

function OptionSlider({config, range, onChange, sliderLabel, displayedValue, calculatedValue} : Props) {
  return (
    <div className="dark:text-neutral-50 w-full flex justify-start items-center gap-3 h-[26px] text-xs">
        <div className="w-1/2 h-1/2 my-auto dark:text-neutral-400">
            {sliderLabel}            
        </div>
        <div className="dark:text-neutral-200 w-1/6 h-1/2 my-auto">
            {displayedValue}
        </div>

        <div className="w-1/2 h-1/2 dark:text-black">
            <ReactSlider
                marks min={range[0]} max={range[1]}
                value={calculatedValue}
                onChange={onChange}
                className="customSlider" 
                thumbClassName="customSlider-thumb"
                trackClassName="customSlider-track"
                markClassName="customSlider-mark"
                renderThumb={(props : any) => <div {...props}></div>}
            />
        </div>
    </div>
  )
}

export default OptionSlider