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
import org.moseti.kedevsapi.payments.repository.*;
import org.moseti.kedevsapi.shared.enums.*;
import org.moseti.kedevsapi.shared.exception.ForbiddenException;
import org.moseti.kedevsapi.spotlight.dto.SpotlightDtos.SlotAvailabilityResponse;
import org.moseti.kedevsapi.spotlight.service.SpotlightService;
import org.moseti.kedevsapi.users.entity.DeveloperProfile;
import org.moseti.kedevsapi.users.entity.EmployerProfile;
import org.moseti.kedevsapi.users.entity.User;
import org.moseti.kedevsapi.users.entity.VerificationRequest;
import org.moseti.kedevsapi.users.repository.DeveloperProfileRepository;
import org.moseti.kedevsapi.users.repository.EmployerProfileRepository;
import org.moseti.kedevsapi.users.repository.UserRepository;
import org.moseti.kedevsapi.users.repository.VerificationRequestRepository;
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
    @Mock private PlatformSettingRepository platformSettingRepository;
    @Mock private UserRepository userRepository;
    @Mock private DeveloperProfileRepository developerProfileRepository;
    @Mock private EmployerProfileRepository employerProfileRepository;
    @Mock private VerificationRequestRepository verificationRequestRepository;
    @Mock private SpotlightService spotlightService;
    @Mock private org.moseti.kedevsapi.notifications.service.NotificationService notificationService;
    @Mock private org.moseti.kedevsapi.auth.service.EmailService emailService;
    @Mock private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

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
        verify(paymentRepository, atLeastOnce()).save(any(Payment.class));
    }



    // 9. handleCallback_verifiedBadge_setsVerified
    @Test
    void handleCallback_verifiedBadge_setsVerified() {
        Payment payment = buildPendingPayment(PaymentType.VERIFIED_BADGE);
        VerificationRequest request = new VerificationRequest();
        request.setUserId(devUserId);
        request.setStatus(VerificationStatus.PENDING_PAYMENT);

        when(paymentRepository.findByMpesaCheckoutId("chk-004")).thenReturn(Optional.of(payment));
        when(userRepository.findById(any())).thenReturn(Optional.of(developer));
        when(verificationRequestRepository.findByUserId(devUserId)).thenReturn(Optional.of(request));

        paymentService.handleCallback(buildSuccessCallback("chk-004", "MPES126"));

        assertThat(request.getStatus()).isEqualTo(VerificationStatus.PENDING_DOCS);
        verify(notificationService).notify(any(), any(), any(), any(), any());
        verify(emailService).sendPaymentConfirmationEmail(any(), any(), any(), any(), any());
    }


    // 11. handleCallback_failure_setsPaymentFailed
    @Test
    void handleCallback_failure_setsPaymentFailed() {
        Payment payment = buildPendingPayment(PaymentType.VERIFIED_BADGE);
        when(paymentRepository.findByMpesaCheckoutId("chk-006")).thenReturn(Optional.of(payment));

        paymentService.handleCallback(buildFailureCallback("chk-006"));

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.CANCELLED);
    }

    // 12. handleCallback_alreadyCompleted_skipsProcessing
    @Test
    void handleCallback_alreadyCompleted_skipsProcessing() {
        Payment payment = buildPendingPayment(PaymentType.VERIFIED_BADGE);
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setMpesaReceiptNo("MPES127");
        when(paymentRepository.findByMpesaCheckoutId("chk-007")).thenReturn(Optional.of(payment));

        paymentService.handleCallback(buildSuccessCallback("chk-007", "MPES128"));

        verify(notificationService, never()).notify(any(), any(), any(), any(), any());
    }

    // 13. handleCallback_unknownCheckoutId_logsWarning
    @Test
    void handleCallback_unknownCheckoutId_logsWarning() {
        when(paymentRepository.findByMpesaCheckoutId("unknown-id")).thenReturn(Optional.empty());

        // Should not throw
        paymentService.handleCallback(buildSuccessCallback("unknown-id", "MPES999"));

        verify(paymentRepository, never()).save(any());
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
