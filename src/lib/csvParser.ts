export const parseCSV = <T>(file: File): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) {
                resolve([]);
                return;
            }

            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                resolve([]);
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim());
            const result: T[] = [];

            for (let i = 1; i < lines.length; i++) {
                const currentLine = lines[i].split(',');
                if (currentLine.length !== headers.length) continue;

                const obj: any = {};
                for (let j = 0; j < headers.length; j++) {
                    const value = currentLine[j].trim();
                    const key = headers[j];

                    // Basic type inference
                    if (value.toLowerCase() === 'true') obj[key] = true;
                    else if (value.toLowerCase() === 'false') obj[key] = false;
                    else if (!isNaN(Number(value)) && value !== '') obj[key] = Number(value);
                    else obj[key] = value;
                }
                result.push(obj as T);
            }
            resolve(result);
        };

        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};
