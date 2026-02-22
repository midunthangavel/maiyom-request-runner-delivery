import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "mission-images";

/**
 * Upload an image file to Supabase Storage.
 * @param file The File object to upload
 * @param folder Optional subfolder (e.g., "missions", "offers")
 * @returns The public URL of the uploaded image, or null on failure
 */
export async function uploadImage(
    file: File,
    folder: string = "general"
): Promise<string | null> {
    try {
        // Generate a unique filename
        const ext = file.name.split(".").pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            console.error("Upload error:", error);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (err) {
        console.error("Upload failed:", err);
        return null;
    }
}

/**
 * Validate image file before upload.
 * Max size: 5MB, allowed types: jpg, jpeg, png, webp, gif
 */
export function validateImageFile(file: File): string | null {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

    if (!ALLOWED_TYPES.includes(file.type)) {
        return "Only JPG, PNG, WebP, and GIF images are allowed.";
    }

    if (file.size > MAX_SIZE) {
        return "Image must be smaller than 5MB.";
    }

    return null; // Valid
}
