
/**
 * Compresses and resizes an image file to a Base64 string.
 * @param file The image file to process.
 * @param maxWidth The maximum width of the output image (default: 300px).
 * @param quality The quality of the output image (0 to 1, default: 0.7).
 * @returns A Promise that resolves to the Base64 string of the compressed image.
 */
export const compressImage = (file: File, maxWidth: number = 300, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to Base64 (JPEG format for better compression than PNG for photos)
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
