package org.moseti.kedevsapi.shared.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Service
public class CloudinaryFileUploadService implements FileUploadService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"
    );
    private final Cloudinary cloudinary;

    public CloudinaryFileUploadService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret) {
        if (cloudName == null || cloudName.isBlank()) {
            throw new IllegalStateException("Cloudinary cloud name must be configured");
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Cloudinary API key must be configured");
        }
        if (apiSecret == null || apiSecret.isBlank()) {
            throw new IllegalStateException("Cloudinary API secret must be configured");
        }
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret));
    }

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException("Unsupported file type. Allowed types: PNG, JPEG, WEBP, PDF");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto",
                    "overwrite", true));
            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new RuntimeException("Cloudinary upload did not return a secure URL");
            }
            return secureUrl.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }
}
