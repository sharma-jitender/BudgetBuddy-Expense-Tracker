import { API_PATHS } from "./apipath";
import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    // Append the image file to the FormData object
    formData.append("image", imageFile);

    try {
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }); 
        return response.data; // Return the image URL from the response
    } catch (error) {
        console.error("Image upload failed:", error);
        throw new Error("Image upload failed. Please try again.");
    }
};

export default uploadImage;