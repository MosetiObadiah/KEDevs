package org.moseti.kedevsapi.payments.service;

import org.junit.jupiter.api.Test;
import org.moseti.kedevsapi.payments.dto.PaymentDtos.DarajaCallbackRequest;
import org.moseti.kedevsapi.payments.entity.Payment;
import org.moseti.kedevsapi.payments.repository.PaymentRepository;
import org.moseti.kedevsapi.shared.enums.PaymentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

@SpringBootTest
@ActiveProfiles("default")
public class ManualVerifyPendingPaymentsTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    public void verifyAllPendingPayments() {
        List<Payment> pendingPayments = paymentRepository.findAllByStatus(PaymentStatus.PENDING);
        System.out.println("Found " + pendingPayments.size() + " pending payments to verify.");

        for (Payment payment : pendingPayments) {
            System.out.println("Verifying payment: " + payment.getId() + " type: " + payment.getType());
            
            // Build a success callback for this payment
            DarajaCallbackRequest.CallbackItem receiptItem =
                    new DarajaCallbackRequest.CallbackItem("MpesaReceiptNumber", "MANUAL-" + System.currentTimeMillis());
            DarajaCallbackRequest.CallbackMetadata metadata =
                    new DarajaCallbackRequest.CallbackMetadata(List.of(receiptItem));
            DarajaCallbackRequest.StkCallback stkCallback =
                    new DarajaCallbackRequest.StkCallback(
                            "m-req", 
                            payment.getMpesaCheckoutId(), 
                            0, 
                            "Manual verification for sandbox testing", 
                            metadata
                    );
            DarajaCallbackRequest.CallbackBody body = new DarajaCallbackRequest.CallbackBody(stkCallback);
            DarajaCallbackRequest callback = new DarajaCallbackRequest(body);

            try {
                paymentService.handleCallback(callback);
                System.out.println("Successfully verified payment: " + payment.getId());
            } catch (Exception e) {
                System.err.println("Failed to verify payment: " + payment.getId() + ". Error: " + e.getMessage());
            }
        }
    }
}
