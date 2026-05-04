package org.moseti.kedevsapi.payments.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.moseti.kedevsapi.payments.dto.PaymentDtos.*;
import org.moseti.kedevsapi.payments.entity.Payment;
import org.moseti.kedevsapi.payments.entity.PlatformSetting;
import org.moseti.kedevsapi.payments.entity.SearchToken;
import org.moseti.kedevsapi.payments.entity.Subscription;
import org.moseti.kedevsapi.payments.exception.*;
import org.moseti.kedevsapi.payments.repository.*;
import org.moseti.kedevsapi.shared.enums.*;
import org.moseti.kedevsapi.shared.exception.ForbiddenException;
import org.moseti.kedevsapi.spotlight.dto.SpotlightDtos.SlotAvailabilityResponse;
import org.moseti.kedevsapi.spotlight.service.SpotlightService;
import org.moseti.kedevsapi.users.entity.DeveloperProfile;
import org.moseti.kedevsapi.users.entity.EmployerProfile;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.EmployerProfileRepository;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private DarajaService darajaService;
    @Mock private PaymentRepository paymentRepository;
    @Mock private SubscriptionRepository subscriptionRepository;
    @Mock private SearchTokenRepository searchTokenRepository;
    @Mock private PlatformSettingRepository platformSettingRepository;
    @Mock private UserRepository userRepository;
    @Mock private DeveloperProfileRepository developerProfileRepository;
    @Mock private EmployerProfileRepository employerProfileRepository;
    @Mock private SpotlightService spotlightService;
    @Mock private org.moseti.kedevsapi.notifications.service.NotificationService notificationService;
    @Mock private org.moseti.kedevsapi.auth.service.EmailService emailService;

    @InjectMocks private PaymentService paymentService;

    private UUID devUserId;
    private UUID empUserId;
    private User developer;
    private User employer;
    private StkPushResponse mockStkPush;

    @BeforeEach
    void setUp() {
        devUserId = UUID.randomUUID();
        empUserId = UUID.randomUUID();

        developer = new User();
        developer.setId(devUserId);
        developer.setRole(Role.DEVELOPER);
        developer.setFullName("Dev User");

        employer = new User();
        employer.setId(empUserId);
        employer.setRole(Role.EMPLOYER);
        employer.setFullName("Emp User");

        mockStkPush = new StkPushResponse(
                "merchant-req-id", "checkout-req-id",
                "0", "Success", "Check your phone"
        );

        lenient().when(platformSettingRepository.findBySettingKey(any())).thenReturn(Optional.empty());
        lenient().when(paymentRepository.save(any())).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        ReflectionTestUtils.setField(paymentService, "spotlightService", spotlightService);
    }

    // 1. initiateAnnualMembership_developer_usesCorrectFee
    @Test
    void initiateAnnualMembership_developer_usesCorrectFee() {
        when(userRepository.findById(devUserId)).thenReturn(Optional.of(developer));
        when(darajaService.initiateSTKPush(any(), eq(BigDecimal.valueOf(100)), any(), any())).thenReturn(mockStkPush);

        PaymentInitiationResponse response = paymentService.initiateAnnualMembership(devUserId, "0712345678");

        assertThat(response.amount()).isEqualByComparingTo(BigDecimal.valueOf(100));
        assertThat(response.checkoutRequestId()).isEqualTo("checkout-req-id");
    }

    // 2. initiateAnnualMembership_employer_usesCorrectFee
    @Test
    void initiateAnnualMembership_employer_usesCorrectFee() {
        when(userRepository.findById(empUserId)).thenReturn(Optional.of(employer));
        when(darajaService.initiateSTKPush(any(), eq(BigDecimal.valueOf(200)), any(), any())).thenReturn(mockStkPush);

        PaymentInitiationResponse response = paymentService.initiateAnnualMembership(empUserId, "0712345678");

        assertThat(response.amount()).isEqualByComparingTo(BigDecimal.valueOf(200));
    }

    // 3. initiateProUpgrade_alreadyPro_throws
    @Test
    void initiateProUpgrade_alreadyPro_throws() {
        when(userRepository.findById(empUserId)).thenReturn(Optional.of(employer));
        when(subscriptionRepository.existsByUserIdAndTypeAndStatus(
                empUserId, SubscriptionType.EMPLOYER_PRO, SubscriptionStatus.ACTIVE)).thenReturn(true);

        assertThatThrownBy(() -> paymentService.initiateProUpgrade(empUserId, "0712345678"))
                .isInstanceOf(AlreadySubscribedException.class);
    }

    // 4. initiateVerifiedBadge_alreadyVerified_throws
    @Test
    void initiateVerifiedBadge_alreadyVerified_throws() {
        DeveloperProfile devProfile = new DeveloperProfile();
        devProfile.setVerified(true);

        when(userRepository.findById(devUserId)).thenReturn(Optional.of(developer));
        when(developerProfileRepository.findByUserId(devUserId)).thenReturn(Optional.of(devProfile));

        assertThatThrownBy(() -> paymentService.initiateVerifiedBadge(devUserId, "0712345678"))
                .isInstanceOf(AlreadyVerifiedException.class);
    }

    // 5. initiateSearchToken_success
    @Test
    void initiateSearchToken_success() {
        when(userRepository.findById(empUserId)).thenReturn(Optional.of(employer));
        when(darajaService.initiateSTKPush(any(), eq(BigDecimal.valueOf(500)), any(), any())).thenReturn(mockStkPush);

        PaymentInitiationResponse response = paymentService.initiateSearchToken(empUserId, "0712345678");

        assertThat(response.amount()).isEqualByComparingTo(BigDecimal.valueOf(500));
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void initiateSpotlight_slotTaken_throwsException() {
        when(userRepository.findById(devUserId)).thenReturn(Optional.of(developer));
        when(spotlightService.checkSlotAvailability()).thenReturn(
                new SlotAvailabilityResponse(false, true, LocalDateTime.now(), null, 50.0, 250.0)
        );

        assertThrows(SpotlightSlotTakenException.class, () ->
                paymentService.initiateSpotlight(devUserId, "0712345678", SpotlightType.DAY));
    }

    @Test
    void initiateSpotlight_slotAvailable_initiatesPayment() {
        when(userRepository.findById(devUserId)).thenReturn(Optional.of(developer));
        when(spotlightService.checkSlotAvailability()).thenReturn(
                new SlotAvailabilityResponse(true, true, null, null, 50.0, 250.0)
        );
        PlatformSetting setting = new PlatformSetting();
        setting.setSettingValue("100");
        when(platformSettingRepository.findBySettingKey("SPOTLIGHT_DAY_FEE"))
                .thenReturn(Optional.of(setting));
        StkPushResponse stkResponse = new StkPushResponse("mReq", "cReq", "0", "Success", "Success");
        when(darajaService.initiateSTKPush(any(), any(), any(), any())).thenReturn(stkResponse);

        PaymentInitiationResponse res = paymentService.initiateSpotlight(devUserId, "0712345678", SpotlightType.DAY);

        assertNotNull(res);
        assertEquals("cReq", res.checkoutRequestId());
        verify(paymentRepository).save(any(Payment.class));
    }

    // 6. handleCallback_success_completesPayment
    @Test
    void handleCallback_success_completesPayment() {
        Payment payment = buildPendingPayment(PaymentType.ANNUAL_MEMBERSHIP);
        when(paymentRepository.findByMpesaCheckoutId("chk-001")).thenReturn(Optional.of(payment));
        when(userRepository.findById(any())).thenReturn(Optional.of(developer));
        when(subscriptionRepository.findByUserIdAndTypeAndStatus(any(), any(), any())).thenReturn(Optional.empty());
        when(subscriptionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        paymentService.handleCallback(buildSuccessCallback("chk-001", "MPES123"));

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(payment.getMpesaReceiptNo()).isEqualTo("MPES123");
    }

    // 7. handleCallback_annualMembership_createsSubscription
    @Test
    void handleCallback_annualMembership_createsSubscription() {
        Payment payment = buildPendingPayment(PaymentType.ANNUAL_MEMBERSHIP);
        when(paymentRepository.findByMpesaCheckoutId("chk-002")).thenReturn(Optional.of(payment));
        when(subscriptionRepository.findByUserIdAndTypeAndStatus(any(), any(), any())).thenReturn(Optional.empty());
        when(subscriptionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(userRepository.findById(any())).thenReturn(Optional.of(developer));

        paymentService.handleCallback(buildSuccessCallback("chk-002", "MPES124"));

        verify(subscriptionRepository, atLeastOnce()).save(any(Subscription.class));
        verify(notificationService).notify(any(), any(), any(), any(), any());
        verify(emailService).sendPaymentConfirmationEmail(any(), any(), any(), any(), any());
    }

    // 8. handleCallback_proUpgrade_setsProAccount
    @Test
    void handleCallback_proUpgrade_setsProAccount() {
        Payment payment = buildPendingPayment(PaymentType.EMPLOYER_PRO);
        payment.setUserId(empUserId);
        EmployerProfile profile = new EmployerProfile();

        when(paymentRepository.findByMpesaCheckoutId("chk-003")).thenReturn(Optional.of(payment));
        when(subscriptionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(employerProfileRepository.findByUserId(empUserId)).thenReturn(Optional.of(profile));
        when(userRepository.findById(any())).thenReturn(Optional.of(employer));

        paymentService.handleCallback(buildSuccessCallback("chk-003", "MPES125"));

        assertThat(profile.isProAccount()).isTrue();
        verify(notificationService).notify(any(), any(), any(), any(), any());
        verify(emailService).sendPaymentConfirmationEmail(any(), any(), any(), any(), any());
    }

    // 9. handleCallback_verifiedBadge_setsVerified
    @Test
    void handleCallback_verifiedBadge_setsVerified() {
        Payment payment = buildPendingPayment(PaymentType.VERIFIED_BADGE);
        DeveloperProfile devProfile = new DeveloperProfile();

        when(paymentRepository.findByMpesaCheckoutId("chk-004")).thenReturn(Optional.of(payment));
        when(userRepository.findById(any())).thenReturn(Optional.of(developer));
        when(developerProfileRepository.findByUserId(devUserId)).thenReturn(Optional.of(devProfile));

        paymentService.handleCallback(buildSuccessCallback("chk-004", "MPES126"));

        assertThat(devProfile.isVerified()).isTrue();
        verify(notificationService).notify(any(), any(), any(), any(), any());
        verify(emailService).sendPaymentConfirmationEmail(any(), any(), any(), any(), any());
    }

    // 10. handleCallback_searchToken_createsToken
    @Test
    void handleCallback_searchToken_createsToken() {
        Payment payment = buildPendingPayment(PaymentType.SEARCH_TOKEN);
        when(paymentRepository.findByMpesaCheckoutId("chk-005")).thenReturn(Optional.of(payment));

        paymentService.handleCallback(buildSuccessCallback("chk-005", "MPES127"));

        verify(searchTokenRepository).save(any(SearchToken.class));
    }

    // 11. handleCallback_failure_setsPaymentFailed
    @Test
    void handleCallback_failure_setsPaymentFailed() {
        Payment payment = buildPendingPayment(PaymentType.ANNUAL_MEMBERSHIP);
        when(paymentRepository.findByMpesaCheckoutId("chk-006")).thenReturn(Optional.of(payment));

        paymentService.handleCallback(buildFailureCallback("chk-006"));

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    // 12. handleCallback_alreadyCompleted_skipsProcessing
    @Test
    void handleCallback_alreadyCompleted_skipsProcessing() {
        Payment payment = buildPendingPayment(PaymentType.ANNUAL_MEMBERSHIP);
        payment.setStatus(PaymentStatus.COMPLETED);
        when(paymentRepository.findByMpesaCheckoutId("chk-007")).thenReturn(Optional.of(payment));

        paymentService.handleCallback(buildSuccessCallback("chk-007", "MPES128"));

        verify(subscriptionRepository, never()).save(any());
    }

    // 13. handleCallback_unknownCheckoutId_logsWarning
    @Test
    void handleCallback_unknownCheckoutId_logsWarning() {
        when(paymentRepository.findByMpesaCheckoutId("unknown-id")).thenReturn(Optional.empty());

        // Should not throw
        paymentService.handleCallback(buildSuccessCallback("unknown-id", "MPES999"));

        verify(paymentRepository, never()).save(any());
    }

    // 14. consumeSearchToken_success_decrementsCount
    @Test
    void consumeSearchToken_success_decrementsCount() {
        SearchToken token = new SearchToken();
        token.setUsedCount(0);
        token.setTotalUses(3);

        when(searchTokenRepository.findByEmployerIdAndUsedCountLessThanTotalUses(empUserId))
                .thenReturn(List.of(token));

        paymentService.consumeSearchToken(empUserId);

        assertThat(token.getUsedCount()).isEqualTo(1);
        verify(searchTokenRepository).save(token);
    }

    // 15. consumeSearchToken_noTokens_throws
    @Test
    void consumeSearchToken_noTokens_throws() {
        when(searchTokenRepository.findByEmployerIdAndUsedCountLessThanTotalUses(empUserId))
                .thenReturn(List.of());

        assertThatThrownBy(() -> paymentService.consumeSearchToken(empUserId))
                .isInstanceOf(InsufficientSearchTokensException.class);
    }

    // 16. canUseFilterTool_proAccount_returnsTrue
    @Test
    void canUseFilterTool_proAccount_returnsTrue() {
        when(subscriptionRepository.existsByUserIdAndTypeAndStatus(
                empUserId, SubscriptionType.EMPLOYER_PRO, SubscriptionStatus.ACTIVE)).thenReturn(true);

        assertThat(paymentService.canUseFilterTool(empUserId)).isTrue();
    }

    // 17. canUseFilterTool_hasToken_returnsTrue
    @Test
    void canUseFilterTool_hasToken_returnsTrue() {
        when(subscriptionRepository.existsByUserIdAndTypeAndStatus(any(), any(), any())).thenReturn(false);
        when(searchTokenRepository.countByEmployerIdAndUsedCountLessThanTotalUses(empUserId)).thenReturn(2);

        assertThat(paymentService.canUseFilterTool(empUserId)).isTrue();
    }

    // 18. canUseFilterTool_neither_returnsFalse
    @Test
    void canUseFilterTool_neither_returnsFalse() {
        when(subscriptionRepository.existsByUserIdAndTypeAndStatus(any(), any(), any())).thenReturn(false);
        when(searchTokenRepository.countByEmployerIdAndUsedCountLessThanTotalUses(empUserId)).thenReturn(0);

        assertThat(paymentService.canUseFilterTool(empUserId)).isFalse();
    }

    // 19. hasActiveAnnualMembership_active_returnsTrue
    @Test
    void hasActiveAnnualMembership_active_returnsTrue() {
        Subscription sub = new Subscription();
        sub.setEndDate(LocalDateTime.now().plusMonths(6));

        when(subscriptionRepository.findByUserIdAndTypeAndStatus(
                devUserId, SubscriptionType.ANNUAL_MEMBERSHIP, SubscriptionStatus.ACTIVE))
                .thenReturn(Optional.of(sub));

        assertThat(paymentService.hasActiveAnnualMembership(devUserId)).isTrue();
    }

    // 20. hasActiveAnnualMembership_expired_returnsFalse
    @Test
    void hasActiveAnnualMembership_expired_returnsFalse() {
        Subscription sub = new Subscription();
        sub.setEndDate(LocalDateTime.now().minusDays(1)); // Already past

        when(subscriptionRepository.findByUserIdAndTypeAndStatus(
                devUserId, SubscriptionType.ANNUAL_MEMBERSHIP, SubscriptionStatus.ACTIVE))
                .thenReturn(Optional.of(sub));

        assertThat(paymentService.hasActiveAnnualMembership(devUserId)).isFalse();
    }

    // =================== Helpers ===================

    private Payment buildPendingPayment(PaymentType type) {
        Payment p = new Payment();
        p.setId(UUID.randomUUID());
        p.setUserId(devUserId);
        p.setType(type);
        p.setAmount(BigDecimal.valueOf(100));
        p.setStatus(PaymentStatus.PENDING);
        p.setPhoneNumber("254712345678");
        p.setMpesaCheckoutId("chk-001");
        return p;
    }

    private DarajaCallbackRequest buildSuccessCallback(String checkoutId, String receiptNo) {
        DarajaCallbackRequest.CallbackItem receiptItem =
                new DarajaCallbackRequest.CallbackItem("MpesaReceiptNumber", receiptNo);
        DarajaCallbackRequest.CallbackMetadata metadata =
                new DarajaCallbackRequest.CallbackMetadata(List.of(receiptItem));
        DarajaCallbackRequest.StkCallback stkCallback =
                new DarajaCallbackRequest.StkCallback("m-req", checkoutId, 0, "Success", metadata);
        DarajaCallbackRequest.CallbackBody body = new DarajaCallbackRequest.CallbackBody(stkCallback);
        return new DarajaCallbackRequest(body);
    }

    private DarajaCallbackRequest buildFailureCallback(String checkoutId) {
        DarajaCallbackRequest.StkCallback stkCallback =
                new DarajaCallbackRequest.StkCallback("m-req", checkoutId, 1032, "Cancelled", null);
        DarajaCallbackRequest.CallbackBody body = new DarajaCallbackRequest.CallbackBody(stkCallback);
        return new DarajaCallbackRequest(body);
    }
}
