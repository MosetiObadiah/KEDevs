import com.fasterxml.jackson.databind.ObjectMapper;
record Project(boolean isFeatured) {}
public class TestJackson {
    public static void main(String[] args) throws Exception {
        System.out.println(new ObjectMapper().writeValueAsString(new Project(true)));
    }
}
