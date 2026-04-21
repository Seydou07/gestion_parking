/**
 * Utility for exporting data to CSV
 */
export function exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Handle objects, dates, and strings with commas
                const cell = value === null || value === undefined ? '' : 
                             typeof value === 'object' ? JSON.stringify(value).replace(/"/g, '""') : 
                             String(value).replace(/"/g, '""');
                return `"${cell}"`;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
