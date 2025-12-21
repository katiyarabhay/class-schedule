'use client';

import { useRef, useState } from 'react';
import { parseCSV } from '@/lib/csvParser';

interface CsvImporterProps<T> {
    onImport: (data: T[]) => void;
    template?: string; // Optional description of expected headers
    buttonText?: string;
}

export default function CsvImporter<T>({ onImport, template, buttonText = "Import CSV" }: CsvImporterProps<T>) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const data = await parseCSV<T>(file);
            onImport(data);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error("Failed to import CSV", error);
            alert("Failed to parse CSV file.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'inline-block', marginLeft: '1rem' }}>
            <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <button
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title={template ? `Expected Headers: ${template}` : 'Import CSV'}
            >
                {isLoading ? 'Importing...' : buttonText}
            </button>
        </div>
    );
}
