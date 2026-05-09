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
import org.springframework.transaction.annotation.Transactional;

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
        EmployerProfile employer = getProfileEntityByUserId(userId);

        if (!employer.isProAccount()) {
            throw new NotProAccountException("Only Pro employers can send contact requests");
        }

        DeveloperProfile developer = developerProfileRepository.findById(developerId)
                .orElseThrow(() -> new ProfileNotFoundException("Developer profile not found"));

        if (developer.getAvailabilityStatus() == AvailabilityStatus.NOT_AVAILABLE) {
            throw new BadRequestException("Developer is not available for contact");
        }

        // Rate limit check
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        long count = contactRequestRepository.countByEmployerIdAndCreatedAtAfter(employer.getId(), since);
        if (count >= Constants.MAX_CONTACT_REQUESTS_PER_DAY) {
            throw new ContactRequestLimitExceededException(
                    "Contact request limit of " + Constants.MAX_CONTACT_REQUESTS_PER_DAY + " per day exceeded"
            );
        }

        ContactRequest contactRequest = new ContactRequest();
        contactRequest.setEmployerId(employer.getId());
        contactRequest.setDeveloperId(developerId);
        contactRequest.setMessage(request.message());
        contactRequest.setStatus(ContactRequestStatus.PENDING);
        contactRequest = contactRequestRepository.save(contactRequest);

        notificationService.notify(
                developer.getUserId(),
                org.moseti.kedevsapi.shared.enums.NotificationCategory.CONTACT,
                "New Contact Request",
                employer.getCompanyName() + " wants to connect with you.",
                "{\"employerId\":\"" + employer.getId() + "\",\"requestId\":\"" + contactRequest.getId() + "\"}"
        );

        log.info("Contact request sent from employer={} to developer={}", employer.getId(), developerId);
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

        EmployerProfile employer = employerProfileRepository.findById(contactRequest.getEmployerId()).orElse(null);
        if (employer != null) {
            notificationService.notify(
                    employer.getUserId(),
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
    }

    public Page<UserDtos.EmployerProfileResponse> getPublicProfiles(Pageable pageable) {
        return employerProfileRepository.findByIsApprovedTrue(pageable)
                .map(this::toResponse);
    }

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
                profile.getContactPersonName(), email,
                profile.getCompanyName(),
                profile.getCompanyWebsite(), profile.getIndustry(),
                profile.getCompanySize(), profile.getLocationHQ(),
                profile.getCompanyBio(), profile.getLogoUrl(),
                profile.getLinkedinUrl(), profile.getTwitterUrl(),
                profile.isApproved(), profile.isProAccount(),
                profile.getCreatedAt()
        );
    }

    private UserDtos.SavedSearchResponse toSavedSearchResponse(SavedDeveloperSearch s) {
        return new UserDtos.SavedSearchResponse(s.getId(), s.getSearchName(), s.getFilterCriteria(), s.getCreatedAt());
    }

    private UserDtos.ContactRequestResponse toContactRequestResponse(ContactRequest r) {
        return new UserDtos.ContactRequestResponse(
                r.getId(), r.getEmployerId(), r.getDeveloperId(),
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
}
