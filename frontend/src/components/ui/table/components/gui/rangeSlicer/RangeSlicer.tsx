import { RangeSlider }
    from '@mantine/core';
import stylesModules
    from './RangeSlicer.module.css';

// interface RangeSlicerProps {
//     defaultValue: [number, number];
//     onChange: (value: [number, number]) => void;
//     label: string;
// }

const RangeSlicer = () => {
    return (
        <RangeSlider labelAlwaysOn defaultValue={[20, 60]} classNames={stylesModules} />
    );
}

export default RangeSlicer;