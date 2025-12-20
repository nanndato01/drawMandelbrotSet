interface Item{
    name: string;
    val: string;
};

interface Props{
    selects: Item[];
    value: string;
    onChange: (value: string) => void;
};

export default function SelectBox({selects, value, onChange}: Props) {
    return(
        <>
            <select value={value} onChange={(e) => onChange(e.target.value)}
                className="p-1 my-1 mx-3 rounded-xl border-2"
            >
                {selects.map(item => (
                    <option key={item.val} value={item.val}>{item.name}</option>
                ))};
            </select>
        </>
    );
};