package org.moseti.kedevsapi.users.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.notifications.service.NotificationService;
import org.moseti.kedevsapi.payments.dto.PaymentDtos;
import org.moseti.kedevsapi.payments.service.PaymentService;
import org.moseti.kedevsapi.shared.enums.NotificationCategory;
import org.moseti.kedevsapi.shared.enums.Role;
import org.moseti.kedevsapi.shared.enums.VerificationStatus;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.shared.service.FileUploadService;
import org.moseti.kedevsapi.users.dto.VerificationDtos.*;
import org.moseti.kedevsapi.users.entity.DeveloperProfile;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.entity.VerificationRequest;
import org.moseti.kedevsapi.users.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationService {

    private final VerificationRequestRepository verificationRequestRepository;
    private final DeveloperProfileRepository developerProfileRepository;
    private final DeveloperSkillRepository skillRepository;
    private final DeveloperProjectRepository projectRepository;
    private final UserRepository userRepository;
    @Lazy private final PaymentService paymentService;
    private final FileUploadService fileUploadService;
    private final NotificationService notificationService;

    public VerificationStatusResponse getStatus(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        VerificationRequest request = verificationRequestRepository.findByUserId(userId).orElse(null);
        Map<String, Boolean> completeness = checkProfileCompleteness(userId, user.getRole());
        boolean isEligible = completeness.values().stream().allMatch(b -> b);

        VerificationStatus status = request != null ? request.getStatus() : VerificationStatus.NONE;
        
        // If developer is already verified in profile, override the request status
        if (user.getRole() == Role.DEVELOPER) {
            boolean isProfileVerified = developerProfileRepository.findByUserId(userId)
                    .map(DeveloperProfile::isVerified)
                    .orElse(false);
            if (isProfileVerified) {
                status = VerificationStatus.APPROVED;
            }
        }

        return new VerificationStatusResponse(
                status,
                completeness,
                isEligible,
                request != null ? request.getId() : null,
                request != null ? request.getRejectionReason() : null,
                request != null ? request.getCreatedAt() : null
        );
    }

    public Map<String, Boolean> checkProfileCompleteness(UUID userId, Role role) {
        Map<String, Boolean> requirements = new HashMap<>();
        
        if (role == Role.DEVELOPER) {
            DeveloperProfile profile = developerProfileRepository.findByUserId(userId).orElse(null);
            if (profile == null) {
                requirements.put("Profile Created", false);
                return requirements;
            }
            
            requirements.put("Bio", profile.getBio() != null && !profile.getBio().isBlank());
            requirements.put("Current Role", profile.getCurrentLastRole() != null && !profile.getCurrentLastRole().isBlank());
            requirements.put("Location", profile.getLocationCity() != null && !profile.getLocationCity().isBlank());
            requirements.put("Years of Experience", profile.getYearsOfExperience() != null);
            requirements.put("Preferred Work Type", profile.getPreferredWorkType() != null);
            requirements.put("GitHub Link", profile.getGithubUrl() != null && !profile.getGithubUrl().isBlank());
            
            long skillCount = skillRepository.countByDeveloperId(profile.getId());
            requirements.put("At least 3 Skills", skillCount >= 3);
            
            long projectCount = projectRepository.countByDeveloperId(profile.getId());
            requirements.put("At least 1 Project", projectCount >= 1);
        } else {
            // Employer completeness
            requirements.put("Profile Completed", true);
        }
        
        return requirements;
    }

    @Transactional
    public InitiateVerificationResponse initiateVerification(UUID userId, String phoneNumber) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Boolean> completeness = checkProfileCompleteness(userId, user.getRole());
        if (!completeness.values().stream().allMatch(b -> b)) {
            throw new BadRequestException("Profile is not complete enough for verification. Please update your profile.");
        }

        VerificationRequest request = verificationRequestRepository.findByUserId(userId).orElse(null);
        if (request != null) {
            if (request.getStatus() == VerificationStatus.APPROVED) {
                throw new BadRequestException("Profile is already verified.");
            }
            if (request.getStatus() == VerificationStatus.UNDER_REVIEW) {
                throw new BadRequestException("Verification is already under review.");
            }
            if (request.getStatus() == VerificationStatus.PENDING_DOCS) {
                throw new BadRequestException("Payment already received. Please upload documents instead.");
            }
        }

        PaymentDtos.PaymentInitiationResponse paymentResponse = paymentService.initiateVerifiedBadge(userId, phoneNumber);

        if (request == null) {
            request = new VerificationRequest();
            request.setUserId(userId);
            request.setRole(user.getRole());
        } else if (request.getStatus() == VerificationStatus.REJECTED) {
            request.setStatus(VerificationStatus.PENDING_PAYMENT);
            request.setRejectionReason(null);
        }
        
        verificationRequestRepository.save(request);

        return new InitiateVerificationResponse(
                request.getId(),
                paymentResponse.checkoutRequestId(),
                paymentResponse.message()
        );
    }

    @Transactional
    public void submitDocuments(UUID userId, MultipartFile idDoc, MultipartFile passportPhoto, List<MultipartFile> certificates) {
        VerificationRequest request = verificationRequestRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification request not found. Please pay first."));

        if (request.getStatus() != VerificationStatus.PENDING_DOCS && request.getStatus() != VerificationStatus.REJECTED) {
            throw new BadRequestException("Invalid state for document submission: " + request.getStatus());
        }

        if (idDoc != null && !idDoc.isEmpty()) {
            request.setIdDocumentUrl(fileUploadService.uploadFile(idDoc, "kedevs/verification/ids"));
        } else if (request.getIdDocumentUrl() == null) {
            throw new BadRequestException("National ID / Passport copy is required");
        }

        if (passportPhoto != null && !passportPhoto.isEmpty()) {
            request.setPassportPhotoUrl(fileUploadService.uploadFile(passportPhoto, "kedevs/verification/photos"));
        } else if (request.getPassportPhotoUrl() == null) {
            throw new BadRequestException("Passport photo is required");
        }

        if (certificates != null && !certificates.isEmpty()) {
            for (MultipartFile cert : certificates) {
                request.getCertificateUrls().add(fileUploadService.uploadFile(cert, "kedevs/verification/certs"));
            }
        }

        request.setStatus(VerificationStatus.UNDER_REVIEW);
        verificationRequestRepository.save(request);
        
        notificationService.notify(userId, NotificationCategory.ADMIN, 
                "Documents Submitted", 
                "Your verification documents have been received and are under review. Expected outcome in 2-5 business days.", null);
    }
}
