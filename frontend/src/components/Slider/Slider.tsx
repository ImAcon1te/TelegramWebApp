import {useCallback, useEffect, useRef, FC, useMemo} from "react";
import "./Slider.css";

interface Props{
  min: number,
  max: number,
  minValue: number
  maxValue: number
  onChange: ({min, max}: {min:number, max: number}) => void
}
export const Slider:FC<Props> = ({ min, max, onChange, minValue, maxValue }) => {
  if(max === min || min>max){
    return null
  }
  const range = useRef<any>(null);

  const minVal = useMemo(() => {
    if(minValue < min){
      return min
    }
    if(minValue > max){
      return max
    }
    return minValue
  }, [minValue, min])

  const maxVal = useMemo(() => {
    if(maxValue > max){
      return max
    }
    return minVal > maxValue ? minVal : maxValue;
  }, [maxValue, minVal, min])

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, maxVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal,minVal, getPercent]);

  // Get min and max values when their state changes
  // useEffect(() => {
  //   onChange({ min: minVal, max: maxVal });
  // }, [minVal, maxVal, onChange]);

  return (
    <div className="slider__container">
      <div className="slider_values">
        <div className="slider__left-value">{minVal}</div>
        <div className="slider__right-value">{maxVal}</div>
      </div>
      <div className="slider">
        <div className="slider__track" />
        <div ref={range} className="slider__range" />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxValue - 1);
          onChange({min: value, max: maxValue})
          // minValRef.current = value;
        }}
        className="thumb thumb--left"
        style={{ zIndex: minValue > max - 100 ? 5 : 4 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minValue + 1);
          onChange({min: minValue, max: value})

          // maxValRef.current = value;
        }}
        className="thumb thumb--right"
      />


    </div>
  );
};

