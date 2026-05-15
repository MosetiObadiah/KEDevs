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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployerProfileService {

    private final EmployerProfileRepository employerProfileRepository;
    private final DeveloperProfileRepository developerProfileRepository;
    private final SavedDeveloperSearchRepository savedSearchRepository;
    private final BookmarkedDeveloperRepository bookmarkRepository;
    private final ContactRequestRepository contactRequestRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final FileUploadService fileUploadService;
    private final org.moseti.kedevsapi.shared.service.SettingService settingService;
    private final UserFlagRepository userFlagRepository;


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

    /**
     * Used by @PreAuthorize SpEL in EmployerController.
     * Checks if the user identified by userId has a Pro employer account.
     */
    public boolean isProAccount(UUID userId) {
        return employerProfileRepository.findByUserId(userId)
                .map(EmployerProfile::isProAccount)
                .orElse(false);
    }

    // ----------------------------------------------------------------
    // Saved Searches
    // ----------------------------------------------------------------

    @Transactional
    public UserDtos.SavedSearchResponse saveSearch(UUID userId, UserDtos.SaveSearchRequest request) {
        EmployerProfile profile = getProfileEntityByUserId(userId);
        SavedDeveloperSearch search = new SavedDeveloperSearch();
        search.setEmployerId(profile.getId());
        search.setSearchName(request.searchName());
        search.setFilterCriteria(toJsonString(request.filterCriteria()));
        search = savedSearchRepository.save(search);
        return toSavedSearchResponse(search);
    }

    public List<UserDtos.SavedSearchResponse> getSavedSearches(UUID userId) {
        EmployerProfile profile = getProfileEntityByUserId(userId);
        return savedSearchRepository.findByEmployerId(profile.getId())
                .stream().map(this::toSavedSearchResponse).toList();
    }

    @Transactional
    public void deleteSavedSearch(UUID userId, UUID searchId) {
        EmployerProfile profile = getProfileEntityByUserId(userId);
        SavedDeveloperSearch search = savedSearchRepository.findById(searchId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved search not found"));
        if (!search.getEmployerId().equals(profile.getId())) {
            throw new BadRequestException("Saved search does not belong to this employer");
        }
        savedSearchRepository.delete(search);
    }

    // ----------------------------------------------------------------
    // Bookmarks
    // ----------------------------------------------------------------

    @Transactional
    public UserDtos.BookmarkResponse bookmarkDeveloper(UUID userId, UUID developerId) {
        EmployerProfile employer = getProfileEntityByUserId(userId);
        DeveloperProfile developer = developerProfileRepository.findById(developerId)
                .orElseThrow(() -> new ProfileNotFoundException("Developer profile not found"));

        if (bookmarkRepository.existsByEmployerIdAndDeveloperId(employer.getId(), developerId)) {
            throw new BadRequestException("Developer is already bookmarked");
        }

        BookmarkedDeveloper bookmark = new BookmarkedDeveloper();
        bookmark.setEmployerId(employer.getId());
        bookmark.setDeveloperId(developerId);
        bookmark = bookmarkRepository.save(bookmark);

        String developerName = developer.getFirstName() + " " + developer.getLastName();
        return new UserDtos.BookmarkResponse(bookmark.getId(), developerId, developerName, bookmark.getCreatedAt());
    }

    @Transactional
    public void removeBookmark(UUID userId, UUID developerId) {
        EmployerProfile employer = getProfileEntityByUserId(userId);
        BookmarkedDeveloper bookmark = bookmarkRepository.findByEmployerIdAndDeveloperId(employer.getId(), developerId)
                .orElseThrow(() -> new ResourceNotFoundException("Bookmark not found"));
        bookmarkRepository.delete(bookmark);
    }

    public Page<UserDtos.BookmarkResponse> getBookmarks(UUID userId, Pageable pageable) {
        EmployerProfile employer = getProfileEntityByUserId(userId);
        return bookmarkRepository.findByEmployerId(employer.getId(), pageable)
                .map(bm -> {
                    DeveloperProfile dev = developerProfileRepository.findById(bm.getDeveloperId()).orElse(null);
                    String name = dev != null ? dev.getFirstName() + " " + dev.getLastName() : "Unknown";
                    return new UserDtos.BookmarkResponse(bm.getId(), bm.getDeveloperId(), name, bm.getCreatedAt());
                });
    }

    // ----------------------------------------------------------------
    // Contact Requests
    // ----------------------------------------------------------------

    @Transactional
    public UserDtos.ContactRequestResponse sendContactRequest(UUID userId, UUID developerId, UserDtos.ContactRequestDto request) {
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Only enforce Pro accounts for Employer roles
        if (sender.getRole() == org.moseti.kedevsapi.shared.enums.Role.EMPLOYER) {
            EmployerProfile employer = employerProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ProfileNotFoundException("Employer profile not found"));
            if (!employer.isProAccount()) {
                throw new NotProAccountException("Only Pro employers can send contact requests");
            }
        }

        DeveloperProfile developer = developerProfileRepository.findById(developerId)
                .orElseThrow(() -> new ProfileNotFoundException("Developer profile not found"));

        if (developer.getAvailabilityStatus() == AvailabilityStatus.NOT_AVAILABLE) {
            throw new BadRequestException("This developer is currently not accepting contact requests.");
        }

        if (!developer.isCanEmployersReachOut()) {
            throw new BadRequestException("This developer has disabled direct contact.");
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

        notificationService.notify(
                developer.getUserId(),
                org.moseti.kedevsapi.shared.enums.NotificationCategory.CONTACT,
                "New Contact Request",
                sender.getFullName() + " wants to connect with you.",
                "{\"senderUserId\":\"" + userId + "\",\"requestId\":\"" + contactRequest.getId() + "\"}"
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
        log.info("Employer verification documents uploaded for userId={}", userId);
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public Page<UserDtos.EmployerProfileResponse> getPublicProfiles(Pageable pageable) {
        return employerProfileRepository.findByIsApprovedTrue(pageable)
                .map(this::toResponse);
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
                profile.isApproved(), profile.isVerified(), profile.isProAccount(),
                profile.getCreatedAt()
        );
    }

    private UserDtos.SavedSearchResponse toSavedSearchResponse(SavedDeveloperSearch s) {
        return new UserDtos.SavedSearchResponse(s.getId(), s.getSearchName(), s.getFilterCriteria(), s.getCreatedAt());
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
}
