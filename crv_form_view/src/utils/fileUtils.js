export function getFileBase64(file){
    const reader = new FileReader();
    const base64=reader.readAsDataURL(file);
    return base64;
}