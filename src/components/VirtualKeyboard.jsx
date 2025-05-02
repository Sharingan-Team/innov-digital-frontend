import { X, ArrowLeft, Space, ChevronsUp } from "lucide-react";

export function VirtualKeyboard({
    onKeyPress,
    onBackspace,
    onClear,
    onShift,
    isShifted,
    onClose,
}) {
    const keyboardRows = [
        isShifted
            ? ["~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+"]
            : ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],

        isShifted
            ? ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "{", "}", "|"]
            : ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],

        isShifted
            ? ["A", "S", "D", "F", "G", "H", "J", "K", "L", ":", '"']
            : ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],

        isShifted
            ? ["Z", "X", "C", "V", "B", "N", "M", "<", ">", "?"]
            : ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
    ];

    return (
        <div className="bg-background border rounded-md p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium">Clavier Virtuel Sécurisé</h3>
                {onClose && (
                    <button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {keyboardRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2 justify-center">
                        {rowIndex === 1 && <div className="w-[24px]" />}
                        {rowIndex === 2 && <div className="w-[36px]" />}
                        {rowIndex === 3 && <div className="w-[52px]" />}

                        {row.map((key) => (
                            <button
                                key={key}
                                variant="outline"
                                className="h-12 w-12 text-base flex items-center justify-center p-0 font-medium"
                                onClick={() => onKeyPress(key)}
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                ))}

                <div className="flex gap-2 mt-2">
                    <button
                        variant="outline"
                        className={`h-12 px-3 text-sm font-medium ${isShifted ? "bg-primary/10" : ""}`}
                        onClick={onShift}
                    >
                        <ChevronsUp className="h-5 w-5 mr-1" />
                        Shift
                    </button>

                    <button variant="outline" className="h-12 flex-1 font-medium" onClick={() => onKeyPress(" ")}>
                        <Space className="h-5 w-5" />
                        Espace
                    </button>

                    <button variant="outline" className="h-12 px-3 text-sm font-medium" onClick={onBackspace}>
                        <ArrowLeft className="h-5 w-5 mr-1" />
                        Retour
                    </button>

                    <button variant="outline" className="h-12 px-3 text-sm font-medium" onClick={onClear}>
                        Effacer
                    </button>
                </div>
            </div>
        </div>
    );
}
