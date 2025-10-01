interface IStep2 {
    onClose: () => void;
}

const Step2 = ({
    onClose
}: IStep2) => {
    return (
        <div>
            <h1>Step 2</h1>
        </div>
    )
}

export default Step2;
