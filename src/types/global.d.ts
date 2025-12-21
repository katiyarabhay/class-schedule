export { };

declare global {
    interface Window {
        electronAPI?: {
            generateSchedule: (data: any) => Promise<any>;
            dataAPI?: (args: any) => Promise<any>;
        };
    }
}
