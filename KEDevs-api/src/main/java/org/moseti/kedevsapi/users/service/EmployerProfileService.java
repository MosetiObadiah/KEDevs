package org.moseti.kedevsapi.users.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.shared.enums.AvailabilityStatus;
import org.moseti.kedevsapi.shared.enums.ContactRequestStatus;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.shared.util.Constants;
import org.moseti.kedevsapi.users.dto.UserDtos;
import org.moseti.kedevsapi.users.entity.*;
import org.moseti.kedevsapi.users.exception.*;
import org.moseti.kedevsapi.users.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.moseti.kedevsapi.notifications.service.NotificationService;
import org.moseti.kedevsapi.shared.service.FileUploadService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.moseti.kedevsapi.payments.entity.UserFlag;
import org.moseti.kedevsapi.payments.repository.UserFlagRepository;
import org.moseti.kedevsapi.payments.service.PaymentService;
import org.moseti.kedevsapi.shared.enums.VerificationStatus;
import org.springframework.context.annotation.Lazy;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployerProfileService {

    private final EmployerProfileRepository employerProfileRepository;
    private final DeveloperProfileRepository developerProfileRepository;
    private final ContactRequestRepository contactRequestRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final FileUploadService fileUploadService;
    private final org.moseti.kedevsapi.shared.service.SettingService settingService;
    private final UserFlagRepository userFlagRepository;
    private final VerificationRequestRepository verificationRequestRepository;
    @Lazy private final PaymentService paymentService;
    private final BlockedUserRepository blockedUserRepository;
    private final org.moseti.kedevsapi.jobs.repository.JobPostRepository jobPostRepository;
    private final PdfExportService pdfExportService;
    private final CompanyInquiryRepository companyInquiryRepository;
    private final org.moseti.kedevsapi.chat.service.ChatService chatService;


    // ----------------------------------------------------------------
    // Profile CRUD
    // ----------------------------------------------------------------

    @Transactional
    public UserDtos.EmployerProfileResponse createProfile(UUID userId, UserDtos.CreateEmployerProfileRequest request) {
        if (employerProfileRepository.existsByUserId(userId)) {
            throw new ProfileAlreadyExistsException("Employer profile already exists for this user");
        }

        EmployerProfile profile = new EmployerProfile();
        profile.setUserId(userId);
        applyCreateFields(profile, request);
        profile = employerProfileRepository.save(profile);

        log.info("Employer profile created for userId={}", userId);
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public UserDtos.EmployerProfileResponse getProfileByUserId(UUID userId) {
        EmployerProfile profile = getProfileEntityByUserId(userId);
        return toResponse(profile);
    }

    @Transactional
    public UserDtos.EmployerProfileResponse updateProfile(UUID userId, UserDtos.UpdateEmployerProfileRequest request) {
        EmployerProfile profile = getProfileEntityByUserId(userId);
        applyUpdateFields(profile, request);
        profile = employerProfileRepository.save(profile);
        log.info("Employer profile updated for userId={}", userId);
        return toResponse(profile);
    }

    @Transactional
    public void approveEmployer(UUID employerProfileId) {
        EmployerProfile profile = employerProfileRepository.findById(employerProfileId)
                .orElseThrow(() -> new ProfileNotFoundException("Employer profile not found"));
        profile.setApproved(true);
        employerProfileRepository.save(profile);
        log.info("Employer profile approved: id={}", employerProfileId);
    }



    // ----------------------------------------------------------------
    // Contact Requests
    // ----------------------------------------------------------------

    @Transactional
    public UserDtos.ContactRequestResponse sendContactRequest(UUID userId, UUID developerId, UserDtos.ContactRequestDto request) {
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));


        DeveloperProfile developer = developerProfileRepository.findById(developerId)
                .orElseThrow(() -> new ProfileNotFoundException("Developer profile not found"));

        if (developer.getUserId().equals(userId)) {
            throw new BadRequestException("You cannot send a contact request to yourself.");
        }

        if (developer.getAvailabilityStatus() == AvailabilityStatus.NOT_AVAILABLE) {
            throw new BadRequestException("This developer is currently not accepting contact requests.");
        }

        if (!developer.isCanEmployersReachOut()) {
            throw new BadRequestException("This developer has disabled direct contact.");
        }

        // Block check
        if (blockedUserRepository.existsByBlockerIdAndBlockedId(developer.getUserId(), userId)) {
            throw new BadRequestException("You have been blocked by this user.");
        }

        // Rate limit check
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        long count = contactRequestRepository.countBySenderUserIdAndCreatedAtAfter(userId, since);
        int limit = settingService.getContactLimit();
        if (count >= limit) {
            throw new ContactRequestLimitExceededException(
                    "Contact request limit of " + limit + " per day exceeded"
            );
        }

        ContactRequest contactRequest = new ContactRequest();
        contactRequest.setSenderUserId(userId);
        contactRequest.setDeveloperId(developerId);
        contactRequest.setMessage(request.message());
        contactRequest.setStatus(ContactRequestStatus.PENDING);
        contactRequest = contactRequestRepository.save(contactRequest);

        String companyIdStr = "";
        String senderDeveloperIdStr = "";
        
        if (sender.getRole() == org.moseti.kedevsapi.shared.enums.Role.EMPLOYER) {
            java.util.Optional<EmployerProfile> empProfile = employerProfileRepository.findByUserId(userId);
            if (empProfile.isPresent()) {
                companyIdStr = empProfile.get().getId().toString();
            }
        } else if (sender.getRole() == org.moseti.kedevsapi.shared.enums.Role.DEVELOPER) {
            java.util.Optional<DeveloperProfile> devProfile = developerProfileRepository.findByUserId(userId);
            if (devProfile.isPresent()) {
                senderDeveloperIdStr = devProfile.get().getId().toString();
            }
        }

        notificationService.notify(
                developer.getUserId(),
                org.moseti.kedevsapi.shared.enums.NotificationCategory.CONTACT,
                "New Message from " + sender.getFullName(),
                request.message(),
                String.format("{\"senderUserId\":\"%s\",\"requestId\":\"%s\",\"message\":\"%s\",\"senderName\":\"%s\",\"companyId\":\"%s\",\"senderDeveloperId\":\"%s\"}", 
                        userId, contactRequest.getId(), 
                        request.message().replace("\"", "\\\"").replace("\n", "\\n"),
                        sender.getFullName().replace("\"", "\\\""),
                        companyIdStr, senderDeveloperIdStr)
        );

        log.info("Contact request sent from user={} to developer={}", userId, developerId);
        return toContactRequestResponse(contactRequest);
    }

    @Transactional
    public UserDtos.ContactRequestResponse respondToContactRequest(UUID userId, UUID requestId, ContactRequestStatus status) {
        DeveloperProfile profile = developerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Developer profile not found"));
        ContactRequest contactRequest = contactRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact request not found"));
        if (!contactRequest.getDeveloperId().equals(profile.getId())) {
            throw new BadRequestException("Contact request does not belong to this developer");
        }
        contactRequest.setStatus(status);
        contactRequest = contactRequestRepository.save(contactRequest);

        if (status == ContactRequestStatus.ACCEPTED) {
            chatService.createConversationForAcceptedRequest(contactRequest);
        }

        User sender = userRepository.findById(contactRequest.getSenderUserId()).orElse(null);
        if (sender != null) {
            notificationService.notify(
                    sender.getId(),
                    org.moseti.kedevsapi.shared.enums.NotificationCategory.CONTACT,
                    "Contact Request Update",
                    profile.getFirstName() + " " + profile.getLastName() + " has " + status.name().toLowerCase() + " your contact request.",
                    "{\"developerId\":\"" + profile.getId() + "\",\"requestId\":\"" + contactRequest.getId() + "\"}"
            );
        }

        return toContactRequestResponse(contactRequest);
    }

    public Page<UserDtos.ContactRequestResponse> getContactRequests(UUID userId, Pageable pageable) {
        DeveloperProfile profile = developerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Developer profile not found"));
        return contactRequestRepository.findByDeveloperId(profile.getId(), pageable)
                .map(this::toContactRequestResponse);
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    private EmployerProfile getProfileEntityByUserId(UUID userId) {
        return employerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Employer profile not found"));
    }

    private void applyCreateFields(EmployerProfile profile, UserDtos.CreateEmployerProfileRequest request) {
        profile.setContactPersonName(request.contactPersonName());
        profile.setCompanyName(request.companyName());
        profile.setCompanyWebsite(request.companyWebsite());
        profile.setIndustry(request.industry());
        profile.setCompanySize(request.companySize());
        profile.setLocationHQ(request.locationHQ());
        profile.setCompanyBio(request.companyBio());
        profile.setLogoUrl(request.logoUrl());
        profile.setLinkedinUrl(request.linkedinUrl());
        profile.setTwitterUrl(request.twitterUrl());
        profile.setContactEmail(request.contactEmail());
    }

    private void applyUpdateFields(EmployerProfile profile, UserDtos.UpdateEmployerProfileRequest request) {
        if (request.contactPersonName() != null) profile.setContactPersonName(request.contactPersonName());
        if (request.companyName() != null) profile.setCompanyName(request.companyName());
        if (request.companyWebsite() != null) profile.setCompanyWebsite(request.companyWebsite());
        if (request.industry() != null) profile.setIndustry(request.industry());
        if (request.companySize() != null) profile.setCompanySize(request.companySize());
        if (request.locationHQ() != null) profile.setLocationHQ(request.locationHQ());
        if (request.companyBio() != null) profile.setCompanyBio(request.companyBio());
        if (request.logoUrl() != null) profile.setLogoUrl(request.logoUrl());
        if (request.linkedinUrl() != null) profile.setLinkedinUrl(request.linkedinUrl());
        if (request.twitterUrl() != null) profile.setTwitterUrl(request.twitterUrl());
        if (request.contactEmail() != null) profile.setContactEmail(request.contactEmail());
    }

    @Transactional
    public UserDtos.EmployerProfileResponse uploadLogo(UUID userId, MultipartFile image) {
        EmployerProfile profile = getProfileEntityByUserId(userId);
        String url = fileUploadService.uploadFile(image, "kedevs/employers");
        profile.setLogoUrl(url);
        profile = employerProfileRepository.save(profile);
        log.info("Employer logo updated for userId={}", userId);
        return toResponse(profile);
    }

    @Transactional
    public UserDtos.EmployerProfileResponse uploadVerificationDocuments(
            UUID userId,
            MultipartFile incorporationCertificate,
            MultipartFile kraPinCertificate,
            MultipartFile businessPermit) {
        
        // 1. Check if user has paid for the verified badge
        if (!paymentService.hasCompletedVerifiedBadgePayment(userId)) {
            throw new BadRequestException("Verification payment required before uploading documents.");
        }

        // 2. Check verification request status
        VerificationRequest request = verificationRequestRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification request not found."));
        
        if (request.getStatus() != VerificationStatus.PENDING_DOCS && request.getStatus() != VerificationStatus.REJECTED) {
            throw new BadRequestException("Invalid state for document upload: " + request.getStatus());
        }

        EmployerProfile profile = getProfileEntityByUserId(userId);
        String folder = "kedevs/employers/verification";

        if (incorporationCertificate != null && !incorporationCertificate.isEmpty()) {
            profile.setIncorporationCertificateUrl(fileUploadService.uploadFile(incorporationCertificate, folder));
        }
        if (kraPinCertificate != null && !kraPinCertificate.isEmpty()) {
            profile.setKraPinCertificateUrl(fileUploadService.uploadFile(kraPinCertificate, folder));
        }
        if (businessPermit != null && !businessPermit.isEmpty()) {
            profile.setBusinessPermitUrl(fileUploadService.uploadFile(businessPermit, folder));
        }

        profile = employerProfileRepository.save(profile);
        
        // 3. Update verification request status to UNDER_REVIEW
        request.setStatus(VerificationStatus.UNDER_REVIEW);
        verificationRequestRepository.save(request);

        log.info("Employer verification documents uploaded and status set to UNDER_REVIEW for userId={}", userId);
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public Page<UserDtos.EmployerProfileResponse> getPublicProfiles(UserDtos.EmployerFilterRequest filter, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<EmployerProfile> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();

            predicates.add(cb.isTrue(root.get("isApproved")));

            if (filter != null) {
                if (filter.industries() != null && !filter.industries().isEmpty()) {
                    predicates.add(root.get("industry").in(filter.industries()));
                }
                if (filter.sizes() != null && !filter.sizes().isEmpty()) {
                    predicates.add(root.get("companySize").in(filter.sizes()));
                }
                if (filter.city() != null && !filter.city().isBlank()) {
                    predicates.add(cb.equal(root.get("locationHQ"), filter.city()));
                }
                // Country logic if locationHQ contains city, country
                if (filter.country() != null && !filter.country().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("locationHQ")), "%" + filter.country().toLowerCase() + "%"));
                }
                
                if (filter.hasOpenJobs() != null && filter.hasOpenJobs()) {
                    // This requires a subquery or join to job_posts
                    jakarta.persistence.criteria.Subquery<Long> subquery = query.subquery(Long.class);
                    jakarta.persistence.criteria.Root<org.moseti.kedevsapi.jobs.entity.JobPost> jobRoot = subquery.from(org.moseti.kedevsapi.jobs.entity.JobPost.class);
                    subquery.select(cb.count(jobRoot));
                    subquery.where(
                        cb.equal(jobRoot.get("postedById"), root.get("userId")),
                        cb.equal(jobRoot.get("status"), org.moseti.kedevsapi.shared.enums.JobStatus.OPEN)
                    );
                    predicates.add(cb.greaterThan(subquery, 0L));
                }
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return employerProfileRepository.findAll(spec, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public byte[] exportEmployersToPdf(UserDtos.EmployerFilterRequest filter, UUID currentUserId) {
        List<UserDtos.EmployerProfileResponse> profiles = getPublicProfiles(filter, Pageable.unpaged()).getContent();
        
        String generatedBy = "Guest User";
        if (currentUserId != null) {
            generatedBy = userRepository.findById(currentUserId).map(User::getFullName).orElse("Unknown User");
        }

        return pdfExportService.generateEmployerPdf(profiles, filter, generatedBy);
    }

    @Transactional(readOnly = true)
    public UserDtos.EmployerProfileResponse getPublicProfileById(UUID id) {
        EmployerProfile profile = employerProfileRepository.findById(id)
                .orElseThrow(() -> new ProfileNotFoundException("Employer profile not found"));
        return toResponse(profile);
    }

    private UserDtos.EmployerProfileResponse toResponse(EmployerProfile profile) {
        String email = "Unknown";
        if (profile.getUser() != null) {
            email = profile.getUser().getEmail();
        }

        int openJobsCount = (int) jobPostRepository.countByPostedByIdAndStatus(profile.getUserId(), org.moseti.kedevsapi.shared.enums.JobStatus.OPEN);

        return new UserDtos.EmployerProfileResponse(
                profile.getId(), profile.getUserId(),
                profile.getContactPersonName(),
                profile.getContactEmail() != null ? profile.getContactEmail() : email,
                profile.getCompanyName(),
                profile.getCompanyWebsite(), profile.getIndustry(),
                profile.getCompanySize(), profile.getLocationHQ(),
                profile.getCompanyBio(), profile.getLogoUrl(),
                profile.getLinkedinUrl(), profile.getTwitterUrl(),
                profile.getIncorporationCertificateUrl(),
                profile.getKraPinCertificateUrl(),
                profile.getBusinessPermitUrl(),
                profile.isApproved(), profile.isVerified(),
                openJobsCount,
                profile.getCreatedAt()
        );
    }


    private UserDtos.ContactRequestResponse toContactRequestResponse(ContactRequest r) {
        String name = "Unknown";
        if (r.getSenderUser() != null) {
            name = r.getSenderUser().getFullName();
        }
        return new UserDtos.ContactRequestResponse(
                r.getId(), r.getSenderUserId(), name, r.getDeveloperId(),
                r.getMessage(), r.getStatus(), r.getCreatedAt()
        );
    }

    private String toJsonString(Object obj) {
        if (obj == null) return "{}";
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
    @Transactional
    public void flagEmployer(UUID flaggedById, UUID targetProfileId, UserDtos.FlagUserRequest request) {
        EmployerProfile targetProfile = employerProfileRepository.findById(targetProfileId)
                .orElseThrow(() -> new ProfileNotFoundException("Employer profile not found"));
        
        UUID targetUserId = targetProfile.getUserId();

        if (targetUserId.equals(flaggedById)) {
            throw new BadRequestException("You cannot flag your own profile");
        }

        if (userFlagRepository.existsByFlaggedUserIdAndFlaggedById(targetUserId, flaggedById)) {
            throw new BadRequestException("You have already flagged this user");
        }

        UserFlag flag = new UserFlag();
        flag.setFlaggedUserId(targetUserId);
        flag.setFlaggedById(flaggedById);
        flag.setReason(request.reason());
        flag.setStatus(org.moseti.kedevsapi.shared.enums.UserFlagStatus.PENDING);
        userFlagRepository.save(flag);

        // Notify Admins
        List<User> admins = userRepository.findByRole(org.moseti.kedevsapi.shared.enums.Role.ADMIN);
        String reporterName = userRepository.findById(flaggedById).map(User::getFullName).orElse("Unknown");
        for (User admin : admins) {
            notificationService.notify(
                    admin.getId(),
                    org.moseti.kedevsapi.shared.enums.NotificationCategory.FLAG,
                    "User Profile Flagged",
                    "An employer profile has been flagged by " + reporterName + ".",
                    "{\"flaggedUserId\":\"" + targetUserId + "\"}"
            );
        }
    }

    @Transactional
    public void blockUser(UUID blockerId, UUID blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new BadRequestException("You cannot block yourself");
        }
        if (!blockedUserRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            BlockedUser block = new BlockedUser();
            block.setBlockerId(blockerId);
            block.setBlockedId(blockedId);
            blockedUserRepository.save(block);
            log.info("User {} blocked user {}", blockerId, blockedId);
        }
    }

    @Transactional
    public void unblockUser(UUID blockerId, UUID blockedId) {
        blockedUserRepository.deleteByBlockerIdAndBlockedId(blockerId, blockedId);
        log.info("User {} unblocked user {}", blockerId, blockedId);
    }

    @Transactional
    public UserDtos.CompanyInquiryResponse sendCompanyInquiry(UUID developerUserId, UUID companyId, UserDtos.ContactRequestDto request) {
        User sender = userRepository.findById(developerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Developer not found"));

        EmployerProfile company = employerProfileRepository.findById(companyId)
                .orElseThrow(() -> new ProfileNotFoundException("Employer profile not found"));

        if (company.getUserId().equals(developerUserId)) {
            throw new BadRequestException("You cannot send an inquiry to your own company.");
        }

        // Rate limit check: default 5 per day
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        long count = companyInquiryRepository.countBySenderUserIdAndCreatedAtAfter(developerUserId, since);
        if (count >= 5) {
            throw new BadRequestException("Daily limit of 5 inquiries exceeded.");
        }

        CompanyInquiry inquiry = new CompanyInquiry();
        inquiry.setSenderUserId(developerUserId);
        inquiry.setEmployerProfileId(companyId);
        inquiry.setMessage(request.message());
        inquiry.setStatus(ContactRequestStatus.PENDING);
        inquiry = companyInquiryRepository.save(inquiry);

        String senderDeveloperIdStr = "";
        java.util.Optional<DeveloperProfile> devProfile = developerProfileRepository.findByUserId(developerUserId);
        if (devProfile.isPresent()) {
            senderDeveloperIdStr = devProfile.get().getId().toString();
        }

        // Send WebSocket Notification to the Employer (company owner)
        notificationService.notify(
                company.getUserId(),
                org.moseti.kedevsapi.shared.enums.NotificationCategory.CONTACT,
                "New Inquiry from " + sender.getFullName(),
                request.message(),
                String.format("{\"senderUserId\":\"%s\",\"inquiryId\":\"%s\",\"message\":\"%s\",\"senderName\":\"%s\",\"companyId\":\"%s\",\"senderDeveloperId\":\"%s\"}",
                        developerUserId, inquiry.getId(),
                        request.message().replace("\"", "\\\"").replace("\n", "\\n"),
                        sender.getFullName().replace("\"", "\\\""),
                        companyId, senderDeveloperIdStr)
        );

        log.info("Company inquiry sent from developer={} to company={}", developerUserId, companyId);
        return toCompanyInquiryResponse(inquiry);
    }

    public Page<UserDtos.CompanyInquiryResponse> getIncomingInquiries(UUID employerUserId, Pageable pageable) {
        EmployerProfile profile = employerProfileRepository.findByUserId(employerUserId)
                .orElseThrow(() -> new ProfileNotFoundException("Employer profile not found"));
        return companyInquiryRepository.findByEmployerProfileId(profile.getId(), pageable)
                .map(this::toCompanyInquiryResponse);
    }

    @Transactional
    public UserDtos.CompanyInquiryResponse respondToInquiry(UUID employerUserId, UUID inquiryId, ContactRequestStatus status) {
        EmployerProfile profile = employerProfileRepository.findByUserId(employerUserId)
                .orElseThrow(() -> new ProfileNotFoundException("Employer profile not found"));
        
        CompanyInquiry inquiry = companyInquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found"));

        if (!inquiry.getEmployerProfileId().equals(profile.getId())) {
            throw new BadRequestException("Inquiry does not belong to this company");
        }

        inquiry.setStatus(status);
        inquiry = companyInquiryRepository.save(inquiry);

        // Send notification to Developer
        notificationService.notify(
                inquiry.getSenderUserId(),
                org.moseti.kedevsapi.shared.enums.NotificationCategory.CONTACT,
                "Inquiry Update",
                profile.getCompanyName() + " has " + status.name().toLowerCase() + " your inquiry.",
                "{\"companyId\":\"" + profile.getId() + "\",\"inquiryId\":\"" + inquiry.getId() + "\"}"
        );

        return toCompanyInquiryResponse(inquiry);
    }

    private UserDtos.CompanyInquiryResponse toCompanyInquiryResponse(CompanyInquiry inquiry) {
        String senderName = userRepository.findById(inquiry.getSenderUserId())
                .map(User::getFullName)
                .orElse("Unknown Developer");
        return new UserDtos.CompanyInquiryResponse(
                inquiry.getId(),
                inquiry.getSenderUserId(),
                senderName,
                inquiry.getEmployerProfileId(),
                inquiry.getMessage(),
                inquiry.getStatus(),
                inquiry.getCreatedAt()
        );
    }
}
