import java.sql.*;
import java.util.*;

public class CheckPayments {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/kedevs_db";
        Properties props = new Properties();
        props.setProperty("user", "moseti");
        props.setProperty("password", "123a456k");
        
        try (Connection conn = DriverManager.getConnection(url, props)) {
            System.out.println("--- Pending Payments ---");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id, type, amount, status, mpesa_checkout_id, created_at FROM payments WHERE status = 'PENDING' ORDER BY created_at DESC LIMIT 5")) {
                while (rs.next()) {
                    System.out.printf("ID: %s | Type: %s | Amount: %s | Status: %s | CheckoutID: %s | Created: %s%n",
                        rs.getString("id"), rs.getString("type"), rs.getString("amount"), rs.getString("status"), 
                        rs.getString("mpesa_checkout_id"), rs.getString("created_at"));
                }
            }
            
            System.out.println("\n--- Latest Completed Payments ---");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id, type, amount, status, mpesa_receipt_no, paid_at FROM payments WHERE status = 'COMPLETED' ORDER BY paid_at DESC LIMIT 5")) {
                while (rs.next()) {
                    System.out.printf("ID: %s | Type: %s | Amount: %s | Receipt: %s | PaidAt: %s%n",
                        rs.getString("id"), rs.getString("type"), rs.getString("amount"), 
                        rs.getString("mpesa_receipt_no"), rs.getString("paid_at"));
                }
            }
        }
    }
}
