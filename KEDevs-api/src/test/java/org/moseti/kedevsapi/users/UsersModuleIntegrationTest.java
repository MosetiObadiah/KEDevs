package org.moseti.kedevsapi.users;

import org.junit.jupiter.api.Test;
import org.moseti.kedevsapi.auth.service.EmailService;
import org.moseti.kedevsapi.auth.service.JwtService;
import org.moseti.kedevsapi.shared.enums.*;
import org.moseti.kedevsapi.users.entity.*;
import org.moseti.kedevsapi.users.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import org.junit.jupiter.api.BeforeEach;
import tools.jackson.databind.ObjectMapper;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for the Users module using TestContainers (isolated PostgreSQL).
 * EmailService is mocked to avoid SMTP calls during tests.
 */
@SpringBootTest
@Testcontainers
class UsersModuleIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
            .withDatabaseName("kedevs_test")
            .withUsername("test_user")
            .withPassword("test_pass");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        // Dummy OAuth creds so context loads without real env vars
        registry.add("GOOGLE_CLIENT_ID", () -> "test-client-id");
        registry.add("GOOGLE_CLIENT_SECRET", () -> "test-client-secret");
    }

    // Suppress real email sends
    @MockitoBean
    EmailService emailService;

    @Autowired WebApplicationContext context;
    @Autowired ObjectMapper objectMapper;
    MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }
    @Autowired JwtService jwtService;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired UserRepository userRepository;
    @Autowired DeveloperProfileRepository developerProfileRepository;
    @Autowired EmployerProfileRepository employerProfileRepository;
    @Autowired ContactRequestRepository contactRequestRepository;

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    /** Inserts a User row directly — bypasses email verification for speed. */
    private User createUser(String email, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password"));
        user.setFullName("IT User " + role);
        user.setRole(role);
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setEmailVerified(true);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setApprovedByAdmin(role != Role.EMPLOYER); // employers need explicit approval
        user.setGracePeriodEndsAt(LocalDateTime.now().plusDays(3));
        return userRepository.save(user);
    }

    /** Inserts a DeveloperProfile directly with PUBLIC visibility and AVAILABLE status. */
    private DeveloperProfile createDeveloperProfile(UUID userId, ProfileVisibility visibility) {
        DeveloperProfile p = new DeveloperProfile();
        p.setUserId(userId);
        p.setFirstName("Dev");
        p.setLastName("User");
        p.setProfileVisibility(visibility);
        p.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        p.setNumberOfProjects(0);
        return developerProfileRepository.save(p);
    }

    /** Inserts a Pro EmployerProfile directly. */
    private EmployerProfile createProEmployerProfile(UUID userId) {
        EmployerProfile p = new EmployerProfile();
        p.setUserId(userId);
        p.setContactPersonName("Employer");
        p.setCompanyName("Acme " + UUID.randomUUID());
        p.setApproved(true);
        p.setProAccount(true);
        return employerProfileRepository.save(p);
    }

    /** Generates a Bearer token for a given user. */
    private String bearerToken(User user) {
        return "Bearer " + jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
    }

    // ----------------------------------------------------------------
    // Test 1: POST /api/v1/developers/profile creates profile
    // ----------------------------------------------------------------

    @Test
    void createDeveloperProfile_ReturnsOkWithProfileData() throws Exception {
        User developer = createUser("it-create-" + UUID.randomUUID() + "@test.com", Role.DEVELOPER);

        Map<String, Object> body = Map.of(
                "firstName", "Alice",
                "lastName", "Wonder",
                "numberOfProjects", 3
        );

        mockMvc.perform(post("/api/v1/developers/profile")
                .header("Authorization", bearerToken(developer))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.firstName").value("Alice"))
                .andExpect(jsonPath("$.data.lastName").value("Wonder"));
    }

    // ----------------------------------------------------------------
    // Test 2: GET /api/v1/developers/public returns only PUBLIC profiles
    // ----------------------------------------------------------------

    @Test
    void getPublicDevelopers_ReturnsOnlyPublicProfiles() throws Exception {
        // Insert one PUBLIC and one HIDDEN profile
        User pub = createUser("it-pub-" + UUID.randomUUID() + "@test.com", Role.DEVELOPER);
        User hidden = createUser("it-hidden-" + UUID.randomUUID() + "@test.com", Role.DEVELOPER);
        DeveloperProfile pubProfile = createDeveloperProfile(pub.getId(), ProfileVisibility.PUBLIC);
        createDeveloperProfile(hidden.getId(), ProfileVisibility.HIDDEN);

        mockMvc.perform(get("/api/v1/developers/public"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[?(@.id == '" + pubProfile.getId() + "')]").exists())
                .andExpect(jsonPath("$.data.content[?(@.id == '" + hidden.getId() + "')]").doesNotExist());
    }

    // ----------------------------------------------------------------
    // Test 3: POST /api/v1/developers/{profileId}/endorsements prevents self-endorsement
    // ----------------------------------------------------------------

    @Test
    void addEndorsement_SelfEndorsement_Returns400() throws Exception {
        User developer = createUser("it-endorse-" + UUID.randomUUID() + "@test.com", Role.DEVELOPER);
        DeveloperProfile profile = createDeveloperProfile(developer.getId(), ProfileVisibility.PUBLIC);

        Map<String, String> body = Map.of("content", "I am great!");

        mockMvc.perform(post("/api/v1/developers/" + profile.getId() + "/endorsements")
                .header("Authorization", bearerToken(developer))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ----------------------------------------------------------------
    // Test 4: Employer contact request rate limit → 429 after 10/day
    // ----------------------------------------------------------------

    @Test
    void sendContactRequest_ExceedingDailyLimit_Returns429() throws Exception {
        User employer = createUser("it-emp-" + UUID.randomUUID() + "@test.com", Role.EMPLOYER);
        User developer = createUser("it-dev-" + UUID.randomUUID() + "@test.com", Role.DEVELOPER);

        EmployerProfile employerProfile = createProEmployerProfile(employer.getId());
        DeveloperProfile developerProfile = createDeveloperProfile(developer.getId(), ProfileVisibility.PUBLIC);

        String url = "/api/v1/employers/contact/" + developerProfile.getId();
        Map<String, String> body = Map.of("message", "Let's connect!");

        // Send 10 requests — all must succeed (200)
        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post(url)
                    .header("Authorization", bearerToken(employer))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk());
        }

        // 11th request must hit rate limit → 429
        mockMvc.perform(post(url)
                .header("Authorization", bearerToken(employer))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false));
    }
}
