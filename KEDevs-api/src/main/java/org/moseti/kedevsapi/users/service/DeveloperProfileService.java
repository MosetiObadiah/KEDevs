package org.moseti.kedevsapi.users.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.moseti.kedevsapi.shared.enums.AvailabilityStatus;
import org.moseti.kedevsapi.shared.enums.ProfileVisibility;
import org.moseti.kedevsapi.shared.exception.BadRequestException;
import org.moseti.kedevsapi.shared.exception.ResourceNotFoundException;
import org.moseti.kedevsapi.users.dto.UserDtos;
import org.moseti.kedevsapi.users.entity.*;
import org.moseti.kedevsapi.users.exception.AlreadyEndorsedException;
import org.moseti.kedevsapi.users.exception.EndorsementNotAllowedException;
import org.moseti.kedevsapi.users.exception.ProfileAlreadyExistsException;
import org.moseti.kedevsapi.users.exception.ProfileNotFoundException;
import org.moseti.kedevsapi.users.repository.*;
import org.moseti.kedevsapi.payments.exception.PaywallException;
import org.moseti.kedevsapi.shared.service.FileUploadService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.moseti.kedevsapi.notifications.service.NotificationService;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeveloperProfileService {

    private final DeveloperProfileRepository profileRepository;
    private final DeveloperSkillRepository skillRepository;
    private final DeveloperLanguageRepository languageRepository;
    private final DeveloperEducationRepository educationRepository;
    private final DeveloperCertificationRepository certificationRepository;
    private final DeveloperOssContributionRepository ossRepository;
    private final DeveloperAchievementRepository achievementRepository;
    private final DeveloperProjectRepository projectRepository;
    private final EndorsementRepository endorsementRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;
    private final NotificationService notificationService;

    // ----------------------------------------------------------------
    // Profile CRUD
    // ----------------------------------------------------------------

    @Transactional
    public UserDtos.DeveloperProfileResponse createProfile(UUID userId, UserDtos.CreateDeveloperProfileRequest request) {
        if (profileRepository.existsByUserId(userId)) {
            throw new ProfileAlreadyExistsException("Developer profile already exists for this user");
        }

        DeveloperProfile profile = new DeveloperProfile();
        profile.setUserId(userId);
        applyCreateFields(profile, request);
        profile = profileRepository.save(profile);

        // Save skills if provided
        if (request.skills() != null && !request.skills().isEmpty()) {
            for (String skillName : request.skills()) {
                DeveloperSkill skill = new DeveloperSkill();
                skill.setDeveloperId(profile.getId());
                skill.setSkill(skillName.trim());
                skillRepository.save(skill);
            }
        }

        log.info("Developer profile created for userId={}, with {} skills", userId, request.skills() != null ? request.skills().size() : 0);
        return toFullResponse(profile);
    }

    @Transactional(readOnly = true)
    public UserDtos.DeveloperProfileResponse getProfileByUserId(UUID userId) {
        DeveloperProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Developer profile not found"));
        return toFullResponse(profile);
    }

    @Transactional(readOnly = true)
    public UserDtos.DeveloperProfileResponse getPublicProfile(UUID profileId) {
        DeveloperProfile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found"));
        if (profile.getProfileVisibility() == ProfileVisibility.HIDDEN) {
            throw new ProfileNotFoundException("Profile not found");
        }
        if (profile.getProfileVisibility() == ProfileVisibility.PRIVATE) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
                throw new org.springframework.security.access.AccessDeniedException("Profile is private");
            }
            Object principal = auth.getPrincipal();
            if (principal instanceof UUID) {
                UUID currentUserId = (UUID) principal;
                if (!profile.getUserId().equals(currentUserId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Profile is private");
                }
            } else {
                throw new org.springframework.security.access.AccessDeniedException("Profile is private");
            }
        }
        return toFullResponse(profile);
    }

    @Transactional
    public UserDtos.DeveloperProfileResponse updateProfile(UUID userId, UserDtos.UpdateDeveloperProfileRequest request) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        applyUpdateFields(profile, request);
        profile = profileRepository.save(profile);
        log.info("Developer profile updated for userId={}", userId);
        return toFullResponse(profile);
    }

    @Transactional
    public void toggleAvailability(UUID userId, AvailabilityStatus status) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        profile.setAvailabilityStatus(status);
        profileRepository.save(profile);
        log.info("Availability updated to {} for userId={}", status, userId);
    }

    @Transactional
    public void updateVisibility(UUID userId, ProfileVisibility visibility) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        profile.setProfileVisibility(visibility);
        profileRepository.save(profile);
        log.info("Profile visibility updated to {} for userId={}", visibility, userId);
    }

    @Transactional
    public UserDtos.DeveloperProfileResponse uploadProfilePhoto(UUID userId, MultipartFile image) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        String url = fileUploadService.uploadFile(image, "kedevs/profiles");
        profile.setProfilePhoto(url);
        profile = profileRepository.save(profile);
        log.info("Profile photo updated for userId={}", userId);
        return toFullResponse(profile);
    }

    // ----------------------------------------------------------------
    // Skills
    // ----------------------------------------------------------------

    @Transactional
    public void addSkill(UUID userId, String skill) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperSkill developerSkill = new DeveloperSkill();
        developerSkill.setDeveloperId(profile.getId());
        developerSkill.setSkill(skill.trim());
        skillRepository.save(developerSkill);
    }

    @Transactional
    public void removeSkill(UUID userId, String skill) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        skillRepository.deleteByDeveloperIdAndSkillIgnoreCase(profile.getId(), skill);
    }

    // ----------------------------------------------------------------
    // Languages
    // ----------------------------------------------------------------

    @Transactional
    public void addLanguage(UUID userId, String language) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperLanguage lang = new DeveloperLanguage();
        lang.setDeveloperId(profile.getId());
        lang.setLanguage(language.trim());
        languageRepository.save(lang);
    }

    @Transactional
    public void removeLanguage(UUID userId, String language) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        languageRepository.deleteByDeveloperIdAndLanguageIgnoreCase(profile.getId(), language);
    }

    // ----------------------------------------------------------------
    // Education
    // ----------------------------------------------------------------

    @Transactional
    public UserDtos.EducationResponse addEducation(UUID userId, UserDtos.AddEducationRequest request) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperEducation education = new DeveloperEducation();
        education.setDeveloperId(profile.getId());
        education.setInstitution(request.institution());
        education.setQualification(request.qualification());
        education.setFieldOfStudy(request.fieldOfStudy());
        education.setStartYear(request.startYear() != null ? request.startYear() : 0);
        education.setYearCompleted(request.yearCompleted() != null ? request.yearCompleted() : 0);
        education.setCertification(request.isCertification() != null ? request.isCertification() : false);
        education = educationRepository.save(education);
        return toEducationResponse(education);
    }

    @Transactional
    public void deleteEducation(UUID userId, UUID educationId) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperEducation education = educationRepository.findById(educationId)
                .orElseThrow(() -> new ResourceNotFoundException("Education record not found"));
        if (!education.getDeveloperId().equals(profile.getId())) {
            throw new BadRequestException("Education record does not belong to this profile");
        }
        educationRepository.delete(education);
    }

    // ----------------------------------------------------------------
    // Certifications
    // ----------------------------------------------------------------

    @Transactional
    public UserDtos.CertificationResponse addCertification(UUID userId, UserDtos.AddCertificationRequest request) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperCertification cert = new DeveloperCertification();
        cert.setDeveloperId(profile.getId());
        cert.setName(request.name());
        cert.setIssuedBy(request.issuedBy());
        cert.setIssuedDate(request.issuedDate());
        cert.setExpiryDate(request.expiryDate());
        cert.setCertUrl(request.certUrl());
        cert = certificationRepository.save(cert);
        return toCertificationResponse(cert);
    }

    @Transactional
    public void deleteCertification(UUID userId, UUID certId) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperCertification cert = certificationRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certification not found"));
        if (!cert.getDeveloperId().equals(profile.getId())) {
            throw new BadRequestException("Certification does not belong to this profile");
        }
        certificationRepository.delete(cert);
    }

    @Transactional
    public UserDtos.CertificationResponse uploadCertificationImage(UUID userId, UUID certId, MultipartFile image) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperCertification cert = certificationRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certification not found"));
        if (!cert.getDeveloperId().equals(profile.getId())) {
            throw new BadRequestException("Certification does not belong to this profile");
        }

        String url = fileUploadService.uploadFile(image, "kedevs/certifications");
        cert.setCertImageUrl(url);
        cert = certificationRepository.save(cert);
        return toCertificationResponse(cert);
    }

    // ----------------------------------------------------------------
    // OSS Contributions
    // ----------------------------------------------------------------

    @Transactional
    public UserDtos.OssContributionResponse addOssContribution(UUID userId, UserDtos.AddOssContributionRequest request) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperOssContribution oss = new DeveloperOssContribution();
        oss.setDeveloperId(profile.getId());
        oss.setProjectName(request.projectName());
        oss.setRole(request.role());
        oss.setContributionUrl(request.contributionUrl());
        oss.setDescription(request.description());
        oss = ossRepository.save(oss);
        return toOssResponse(oss);
    }

    @Transactional
    public void deleteOssContribution(UUID userId, UUID ossId) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperOssContribution oss = ossRepository.findById(ossId)
                .orElseThrow(() -> new ResourceNotFoundException("OSS contribution not found"));
        if (!oss.getDeveloperId().equals(profile.getId())) {
            throw new BadRequestException("OSS contribution does not belong to this profile");
        }
        ossRepository.delete(oss);
    }

    // ----------------------------------------------------------------
    // Achievements
    // ----------------------------------------------------------------

    @Transactional
    public UserDtos.AchievementResponse addAchievement(UUID userId, UserDtos.AddAchievementRequest request) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperAchievement achievement = new DeveloperAchievement();
        achievement.setDeveloperId(profile.getId());
        achievement.setTitle(request.title());
        achievement.setDescription(request.description());
        achievement.setAchievementUrl(request.achievementUrl());
        achievement.setYear(request.year() != null ? request.year() : 0);
        achievement = achievementRepository.save(achievement);
        return toAchievementResponse(achievement);
    }

    @Transactional
    public void deleteAchievement(UUID userId, UUID achievementId) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperAchievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement not found"));
        if (!achievement.getDeveloperId().equals(profile.getId())) {
            throw new BadRequestException("Achievement does not belong to this profile");
        }
        achievementRepository.delete(achievement);
    }

    // ----------------------------------------------------------------
    // Projects
    // ----------------------------------------------------------------

    @Transactional
    public UserDtos.DeveloperProjectResponse addProject(UUID userId, UserDtos.AddProjectRequest request, MultipartFile screenshot) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperProject project = new DeveloperProject();
        project.setDeveloperId(profile.getId());
        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setTechStack(request.techStack());
        project.setProjectUrl(request.projectUrl());
        project.setRepoUrl(request.repoUrl());
        project.setFeatured(request.isFeatured() != null ? request.isFeatured() : false);

        if (screenshot != null && !screenshot.isEmpty()) {
            String screenshotUrl = fileUploadService.uploadFile(screenshot, "kedevs/projects");
            project.setScreenshotUrl(screenshotUrl);
        } else {
            project.setScreenshotUrl(null);
        }

        if (project.isFeatured()) {
            validateFeaturedProjectRequirements(project);
            resetFeaturedProjects(profile.getId(), null);
        }

        project = projectRepository.save(project);
        return toProjectResponse(project);
    }

    @Transactional
    public UserDtos.DeveloperProjectResponse updateProject(UUID userId, UUID projectId, UserDtos.AddProjectRequest request, MultipartFile screenshot) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!project.getDeveloperId().equals(profile.getId())) {
            throw new BadRequestException("Project does not belong to this profile");
        }

        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setTechStack(request.techStack());
        project.setProjectUrl(request.projectUrl());
        project.setRepoUrl(request.repoUrl());
        project.setFeatured(request.isFeatured() != null ? request.isFeatured() : false);

        if (screenshot != null && !screenshot.isEmpty()) {
            String screenshotUrl = fileUploadService.uploadFile(screenshot, "kedevs/projects");
            project.setScreenshotUrl(screenshotUrl);
        }

        if (project.isFeatured()) {
            validateFeaturedProjectRequirements(project);
            resetFeaturedProjects(profile.getId(), project.getId());
        }

        project = projectRepository.save(project);
        return toProjectResponse(project);
    }

    @Transactional
    public UserDtos.DeveloperProjectResponse uploadProjectScreenshot(UUID userId, UUID projectId, MultipartFile screenshot) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!project.getDeveloperId().equals(profile.getId())) {
            throw new BadRequestException("Project does not belong to this profile");
        }

        String url = fileUploadService.uploadFile(screenshot, "kedevs/projects");
        project.setScreenshotUrl(url);
        project = projectRepository.save(project);
        return toProjectResponse(project);
    }

    @Transactional
    public void deleteProject(UUID userId, UUID projectId) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!project.getDeveloperId().equals(profile.getId())) {
            throw new BadRequestException("Project does not belong to this profile");
        }
        projectRepository.delete(project);
    }

    @Transactional
    public void toggleFeatured(UUID userId, UUID projectId) {
        DeveloperProfile profile = getProfileEntityByUserId(userId);
        DeveloperProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!project.getDeveloperId().equals(profile.getId())) {
            throw new BadRequestException("Project does not belong to this profile");
        }

        boolean desiredFeatured = !project.isFeatured();
        if (desiredFeatured) {
            validateFeaturedProjectRequirements(project);
            resetFeaturedProjects(profile.getId(), project.getId());
        }

        project.setFeatured(desiredFeatured);
        projectRepository.save(project);
    }

    private void validateFeaturedProjectRequirements(DeveloperProject project) {
        if (project.getProjectUrl() == null || project.getProjectUrl().isBlank()) {
            throw new BadRequestException("Live project URL is required to feature a project");
        }
        if (project.getScreenshotUrl() == null || project.getScreenshotUrl().isBlank()) {
            throw new BadRequestException("Project screenshot is required to feature a project");
        }
    }

    private void resetFeaturedProjects(UUID developerId, UUID exceptProjectId) {
        List<DeveloperProject> featuredProjects = projectRepository.findByDeveloperIdAndIsFeatured(developerId, true);
        for (DeveloperProject featured : featuredProjects) {
            if (exceptProjectId == null || !featured.getId().equals(exceptProjectId)) {
                featured.setFeatured(false);
            }
        }
        if (!featuredProjects.isEmpty()) {
            projectRepository.saveAll(featuredProjects);
        }
    }

    // ----------------------------------------------------------------
    // Endorsements
    // ----------------------------------------------------------------

    @Transactional
    public UserDtos.EndorsementResponse addEndorsement(UUID authorUserId, UUID recipientProfileId, UserDtos.CreateEndorsementRequest request) {
        DeveloperProfile recipient = profileRepository.findById(recipientProfileId)
                .orElseThrow(() -> new ProfileNotFoundException("Developer profile not found"));

        // Prevent self-endorsement
        if (recipient.getUserId().equals(authorUserId)) {
            throw new EndorsementNotAllowedException("You cannot endorse your own profile");
        }

        // Check author exists
        userRepository.findById(authorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (endorsementRepository.existsByAuthorIdAndRecipientId(authorUserId, recipientProfileId)) {
            throw new AlreadyEndorsedException("You have already endorsed this developer profile");
        }

        Endorsement endorsement = new Endorsement();
        endorsement.setRecipientId(recipientProfileId);
        endorsement.setAuthorId(authorUserId);
        endorsement.setContent(request.content());
        endorsement = endorsementRepository.save(endorsement);
        
        User author = userRepository.findById(authorUserId).orElse(null);
        if (author != null) {
            notificationService.notify(
                recipient.getUserId(),
                org.moseti.kedevsapi.shared.enums.NotificationCategory.ENDORSEMENT,
                "New Endorsement",
                author.getFullName() + " endorsed your profile!",
                "{\"authorId\":\"" + authorUserId + "\"}"
            );
        }

        return toEndorsementResponse(endorsement, authorUserId);
    }

    // ----------------------------------------------------------------
    // Public / Filtered Listings
    // ----------------------------------------------------------------

    @Transactional(readOnly = true)
    public Page<UserDtos.DeveloperSummaryResponse> getPublicDevelopers(Pageable pageable) {
        return profileRepository.findByProfileVisibility(ProfileVisibility.PUBLIC, pageable)
                .map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public Page<UserDtos.DeveloperSummaryResponse> filterDevelopers(UserDtos.DeveloperFilterRequest filter, Pageable pageable) {
        List<DeveloperProfile> allProfiles = profileRepository.findByProfileVisibility(ProfileVisibility.PUBLIC, Pageable.unpaged()).getContent();

        List<UserDtos.DeveloperSummaryResponse> filtered = allProfiles.stream()
            .filter(p -> filter.availabilityStatus() == null || filter.availabilityStatus() == p.getAvailabilityStatus())
            .filter(p -> filter.locationCity() == null || filter.locationCity().isEmpty() || filter.locationCity().equalsIgnoreCase(p.getLocationCity()))
            .filter(p -> filter.isVerified() == null || !filter.isVerified() || p.isVerified())
            .map(this::toSummaryResponse)
            .filter(s -> matchesKeyword(s, filter.currentLastRole())) // Using currentLastRole property as a general keyword param
            .toList();

        if (pageable.isPaged()) {
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filtered.size());
            List<UserDtos.DeveloperSummaryResponse> pageContent = start <= end ? filtered.subList(start, end) : List.of();
            return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filtered.size());
        }
        return new org.springframework.data.domain.PageImpl<>(filtered, pageable, filtered.size());
    }

    private boolean matchesKeyword(UserDtos.DeveloperSummaryResponse s, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return true;
        String kw = keyword.toLowerCase();
        if (s.firstName() != null && s.firstName().toLowerCase().contains(kw)) return true;
        if (s.lastName() != null && s.lastName().toLowerCase().contains(kw)) return true;
        if (s.currentLastRole() != null && s.currentLastRole().toLowerCase().contains(kw)) return true;
        if (s.skills() != null && s.skills().stream().anyMatch(sk -> sk.toLowerCase().contains(kw))) return true;
        return false;
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    private DeveloperProfile getProfileEntityByUserId(UUID userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Developer profile not found"));
    }

    private void applyCreateFields(DeveloperProfile profile, UserDtos.CreateDeveloperProfileRequest request) {
        profile.setFirstName(request.firstName());
        profile.setLastName(request.lastName());
        profile.setProfilePhoto(request.profilePhoto());
        profile.setBio(request.bio());
        profile.setCurrentLastRole(request.currentLastRole());
        profile.setYearsOfExperience(request.yearsOfExperience());
        if (request.numberOfProjects() != null) {
            profile.setNumberOfProjects(request.numberOfProjects());
        }
        profile.setAvailabilityStatus(request.availabilityStatus() != null ? request.availabilityStatus() : AvailabilityStatus.NOT_AVAILABLE);
        profile.setPreferredWorkType(request.preferredWorkType());
        profile.setLocationCity(request.locationCity());
        profile.setLocationCountry(request.locationCountry());
        profile.setProfileVisibility(request.profileVisibility() != null ? request.profileVisibility() : ProfileVisibility.PUBLIC);
        profile.setLinkedinUrl(request.linkedinUrl());
        profile.setGithubUrl(request.githubUrl());
        profile.setPortfolioUrl(request.portfolioUrl());
        profile.setPublicEmail(request.publicEmail());
        profile.setPublicPhone(request.publicPhone());
    }

    private void applyUpdateFields(DeveloperProfile profile, UserDtos.UpdateDeveloperProfileRequest request) {
        if (request.firstName() != null) profile.setFirstName(request.firstName());
        if (request.lastName() != null) profile.setLastName(request.lastName());
        if (request.profilePhoto() != null) profile.setProfilePhoto(request.profilePhoto());
        if (request.bio() != null) profile.setBio(request.bio());
        if (request.currentLastRole() != null) profile.setCurrentLastRole(request.currentLastRole());
        if (request.yearsOfExperience() != null) profile.setYearsOfExperience(request.yearsOfExperience());
        if (request.numberOfProjects() != null) {
            profile.setNumberOfProjects(request.numberOfProjects());
        }
        if (request.preferredWorkType() != null) profile.setPreferredWorkType(request.preferredWorkType());
        if (request.locationCity() != null) profile.setLocationCity(request.locationCity());
        if (request.locationCountry() != null) profile.setLocationCountry(request.locationCountry());
        if (request.linkedinUrl() != null) profile.setLinkedinUrl(request.linkedinUrl());
        if (request.githubUrl() != null) profile.setGithubUrl(request.githubUrl());
        if (request.portfolioUrl() != null) profile.setPortfolioUrl(request.portfolioUrl());
        if (request.publicEmail() != null) profile.setPublicEmail(request.publicEmail());
        if (request.publicPhone() != null) profile.setPublicPhone(request.publicPhone());
    }

    // ----------------------------------------------------------------
    // Mappers
    // ----------------------------------------------------------------

    private UserDtos.DeveloperProfileResponse toFullResponse(DeveloperProfile profile) {
        List<String> skills = skillRepository.findByDeveloperId(profile.getId())
                .stream().map(DeveloperSkill::getSkill).toList();
        List<String> languages = languageRepository.findByDeveloperId(profile.getId())
                .stream().map(DeveloperLanguage::getLanguage).toList();
        List<UserDtos.EducationResponse> education = educationRepository.findByDeveloperId(profile.getId())
                .stream().map(this::toEducationResponse).toList();
        List<UserDtos.CertificationResponse> certs = certificationRepository.findByDeveloperId(profile.getId())
                .stream().map(this::toCertificationResponse).toList();
        List<UserDtos.OssContributionResponse> oss = ossRepository.findByDeveloperId(profile.getId())
                .stream().map(this::toOssResponse).toList();
        List<UserDtos.AchievementResponse> achievements = achievementRepository.findByDeveloperId(profile.getId())
                .stream().map(this::toAchievementResponse).toList();
        List<UserDtos.DeveloperProjectResponse> projects = projectRepository.findByDeveloperId(profile.getId())
                .stream().map(this::toProjectResponse).toList();
        List<UserDtos.EndorsementResponse> endorsements = endorsementRepository.findAllByRecipientId(profile.getId())
                .stream().map(e -> toEndorsementResponse(e, e.getAuthorId())).toList();

        return new UserDtos.DeveloperProfileResponse(
                profile.getId(), profile.getUserId(),
                profile.getFirstName(), profile.getLastName(),
                profile.getProfilePhoto(), profile.getBio(),
                profile.getCurrentLastRole(), profile.getYearsOfExperience(),
                profile.getNumberOfProjects(), profile.getAvailabilityStatus(),
                profile.getPreferredWorkType(), profile.getLocationCity(),
                profile.getLocationCountry(), profile.getProfileVisibility(),
                profile.isVerified(), profile.getLinkedinUrl(),
                profile.getGithubUrl(), profile.getPortfolioUrl(),
                profile.getPublicEmail(), profile.getPublicPhone(),
                skills, languages, education, certs, oss, achievements, projects,
                endorsements, endorsements.size(),
                profile.getCreatedAt()
        );
    }

    private UserDtos.DeveloperSummaryResponse toSummaryResponse(DeveloperProfile profile) {
        List<String> skills = skillRepository.findByDeveloperId(profile.getId())
                .stream().map(DeveloperSkill::getSkill).toList();
        return new UserDtos.DeveloperSummaryResponse(
                profile.getId(),
                profile.getFirstName(), profile.getLastName(),
                profile.getProfilePhoto(), profile.getCurrentLastRole(),
                skills, profile.getAvailabilityStatus(),
                profile.isVerified(), profile.getLocationCity(), profile.getLocationCountry(),
                profile.getPublicEmail(), profile.getPublicPhone()
        );
    }

    private UserDtos.EducationResponse toEducationResponse(DeveloperEducation e) {
        return new UserDtos.EducationResponse(e.getId(), e.getInstitution(), e.getQualification(), e.getFieldOfStudy(), e.getStartYear(), e.getYearCompleted(), e.isCertification());
    }

    private UserDtos.CertificationResponse toCertificationResponse(DeveloperCertification c) {
        return new UserDtos.CertificationResponse(c.getId(), c.getName(), c.getIssuedBy(), c.getIssuedDate(), c.getExpiryDate(), c.getCertUrl(), c.getCertImageUrl());
    }

    private UserDtos.OssContributionResponse toOssResponse(DeveloperOssContribution o) {
        return new UserDtos.OssContributionResponse(o.getId(), o.getProjectName(), o.getRole(), o.getContributionUrl(), o.getDescription());
    }

    private UserDtos.AchievementResponse toAchievementResponse(DeveloperAchievement a) {
        return new UserDtos.AchievementResponse(a.getId(), a.getTitle(), a.getDescription(), a.getAchievementUrl(), a.getYear());
    }

    private UserDtos.DeveloperProjectResponse toProjectResponse(DeveloperProject p) {
        java.util.List<String> techStackList = p.getTechStack() != null && !p.getTechStack().isBlank()
                ? java.util.Arrays.stream(p.getTechStack().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(java.util.stream.Collectors.toList())
                : java.util.Collections.emptyList();
        return new UserDtos.DeveloperProjectResponse(p.getId(), p.getTitle(), p.getDescription(), techStackList, p.getProjectUrl(), p.getRepoUrl(), p.getScreenshotUrl(), p.isFeatured(), p.getCreatedAt());
    }

    private UserDtos.EndorsementResponse toEndorsementResponse(Endorsement e, UUID authorUserId) {
        User author = userRepository.findById(authorUserId).orElse(null);
        String authorName = author != null ? author.getFullName() : "Unknown";
        return new UserDtos.EndorsementResponse(e.getId(), e.getContent(), authorName, e.getAuthorId(), e.getCreatedAt());
    }
}
